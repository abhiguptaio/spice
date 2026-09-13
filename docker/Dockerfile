# SPICE — Scalable Phase-field Implementation of Crack Evolution
#
# The base image ships FEniCS/dolfin 2019.1.0 on Python 3.6, already including
# numpy and mpi4py. It runs as the unprivileged `fenics` user and wraps every
# command in a login shell, so the FEniCS environment is always sourced.
FROM iitrabhi/fenics:latest

# Runtime dependencies the base image does not carry:
#   dataclasses — stdlib from Python 3.7 onward; the base image is Python 3.6,
#                 so src/config.py needs the backport
#   toml        — input-file parser; tomllib is stdlib only from Python 3.11
#   psutil      — per-rank resident memory, reported each iteration
RUN pip3 install --no-cache-dir \
        dataclasses \
        toml \
        psutil

# Mount point for the repository. Owned by `fenics`, which is the user the
# container's entrypoint drops to.
WORKDIR /home/fenics/shared
