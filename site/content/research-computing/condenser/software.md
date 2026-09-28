# Install software on a Condenser Ubuntu VM

This administrator-oriented guide collects the software setup notes from the
Economics-HPC wiki. It assumes Ubuntu 22.04 or 24.04 and an account with `sudo`
access.

> **Draft—not a copy-and-paste build script:** package versions and download
> addresses change. Review every command, install only what the VM needs, and
> follow UCL security and network policies. The original page was migrated on
> 4 September 2026 and still needs technical verification.

## Base development tools

```console
sudo apt update
sudo apt upgrade
sudo apt install build-essential curl wget git unzip software-properties-common
```

Avoid unattended `-y` upgrades until you have reviewed the proposed changes.

## Python

```console
sudo apt install python3 python3-pip python3-venv python3-dev
python3 --version
```

Create a project-specific virtual environment as a regular user:

```console
python3 -m venv .venv
source .venv/bin/activate
```

## GCC and GNU Fortran

```console
sudo apt install gcc g++ gfortran
gcc --version
gfortran --version
```

## Julia

Use the installation method currently recommended in the
[official Julia documentation](https://julialang.org/downloads/). Review any
downloaded installer before running it on a managed VM.

## R

Ubuntu provides R packages:

```console
sudo apt install r-base r-base-dev
R --version
```

For a newer R version, use the instructions for the VM's exact Ubuntu release
from the [R Project](https://cran.r-project.org/bin/linux/ubuntu/).

## RStudio Server

Download the package for the VM's exact Ubuntu release and architecture from
the [official Posit download page](https://posit.co/download/rstudio-server/).
Do not reuse a version-specific URL without checking that it is current.

After installation, inspect the service with:

```console
sudo systemctl status rstudio-server
```

To reach it without exposing port 8787 publicly, create an SSH tunnel from your
computer. Replace the address and username as needed:

```console
ssh -J condenser -L 8787:localhost:8787 ubuntu@VM_IP_ADDRESS
```

Then open <http://localhost:8787>. Give each user an individual Linux account;
do not create or share a generic password-based account.

## Intel oneAPI

Follow Intel's current instructions for
[configuring the APT repository](https://www.intel.com/content/www/us/en/docs/oneapi/installation-guide-linux/2025-0/apt-005.html),
then select only the toolkits the VM requires. The prior guide installed both
`intel-oneapi-base-toolkit` and `intel-oneapi-hpc-toolkit`.

After installation, Intel tools are normally under `/opt/intel`. Load the
environment using the script for the installed version and verify the required
compiler and MPI commands.

For the user-space installation notes, NAG configuration, legacy compiler
settings, and the migrated environment script, see
[Intel oneAPI and NAG on Condenser](../../software/intel-nag-condenser.md).

## ThinLinc

ThinLinc should be installed only when a remote graphical desktop is required.
Use the [official ThinLinc Server documentation](https://www.cendio.com/thinlinc/docs/)
for the current download, installation, TLS, authentication, and firewall
steps. Do not expose SSH, RStudio, or ThinLinc ports broadly without an approved
access-control design.

## Verification checklist

- [ ] Required runtimes and compilers report the expected versions.
- [ ] Each service starts after a reboot and logs to the expected location.
- [ ] User accounts follow the agreed authentication policy.
- [ ] Services are reachable only through approved routes.
- [ ] Firewall and cloud security rules expose no unnecessary ports.
- [ ] System and application updates have an identified owner.
- [ ] A recovery or rebuild procedure has been recorded.

Last reviewed: migration review pending.
