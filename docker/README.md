# Docker

A container with everything SPICE needs to run.

The base image [`iitrabhi/fenics`](https://hub.docker.com/r/iitrabhi/fenics) provides FEniCS/dolfin 2019.1.0 on Python 3.6, with numpy and mpi4py. This image adds the three packages the solver needs on top of it:

| Package | Why |
| --- | --- |
| `dataclasses` | stdlib from Python 3.7 onward; the base image is Python 3.6, so `src/config.py` needs the backport |
| `toml` | input-file parser — `tomllib` is stdlib only from Python 3.11 |
| `psutil` | per-rank resident memory, reported each iteration |

## Build

From the repository root:

```bash
docker build -t spice:latest -f docker/Dockerfile docker/
```

On Apple Silicon, add `--platform linux/amd64` — the base image is amd64 only and will otherwise be refused:

```bash
docker build --platform linux/amd64 -t spice:latest -f docker/Dockerfile docker/
```

## Run

Mount the repository at the container's working directory and pass your command **as a single quoted string**:

```bash
docker run --rm -v "$PWD":/home/fenics/shared spice:latest \
  'python3 main.py --input examples/4.1.accuracy/04.toml'
```

In parallel:

```bash
docker run --rm -v "$PWD":/home/fenics/shared spice:latest \
  'mpirun -np 4 python3 main.py --input examples/4.3.interaction/01.toml'
```

For an interactive shell:

```bash
docker run --rm -it -v "$PWD":/home/fenics/shared spice:latest bash
```

Output lands in the mounted directory, so results and `metrics.csv` are written straight to your working tree.

> [!IMPORTANT]
> The base image's entrypoint ends in `bash -l -c`, so it expects **one** argument. Quote the whole command:
>
> ```bash
> docker run ... spice:latest 'python3 main.py --input examples/...'   # correct
> docker run ... spice:latest python3 main.py --input examples/...     # silently does nothing
> ```
>
> The unquoted form exits 0 with no output, which is easy to mistake for a run that produced nothing.

> [!NOTE]
> On Apple Silicon, add `--platform linux/amd64` to `docker run` as well. The container then runs under emulation, which is fine for small cases but noticeably slower than native — use a Linux amd64 host for the large studies.
