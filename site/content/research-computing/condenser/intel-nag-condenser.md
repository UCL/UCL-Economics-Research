# Intel oneAPI and NAG on Condenser


## Choose system-wide or user-space installation

The general [Condenser software guide](../clusters/condenser/software.md)
describes a system-wide oneAPI installation for VM administrators. The older
Condenser wiki instead installed oneAPI inside a user's home directory because
it reported that the default location was not persistent in that environment.

Before installing anything, ask the VM administrator:

- whether the VM itself is persistent;
- which directories survive a rebuild or restart;
- whether oneAPI is already available; and
- whether you have permission to install it system-wide.

## Install oneAPI in user space

Download the current offline Linux installers for the Base and HPC toolkits
from Intel's [oneAPI installation guide](https://www.intel.com/content/www/us/en/developer/tools/oneapi/toolkits.html).
Verify the downloads and review Intel's current silent-installation options.

The migrated wiki used the following general pattern:

```console
sudo sh DOWNLOADED_INSTALLER.sh -a -s --install-dir="${HOME}/intel" --eula accept
```

Run the appropriate installer for each required toolkit; do not reuse the old
version-specific filename from the wiki. Using `sudo` for a home-directory
installation may create root-owned files, so confirm Intel's current guidance
and the VM's permission model first.

Load the installed environment in the current shell:

```console
source "${HOME}/intel/setvars.sh"
```

Then verify the tools needed by the project, for example:

```console
ifx --version
mpirun --version
```

## Install and configure NAG

The original wiki installed the NAG Fortran Library under `${HOME}/NAG` from a
download obtained from NAG. Obtain the currently licensed release through the
[NAG support site](https://support.nag.com/) or the relevant UCL software route.

After installation, the NAG environment script follows a pattern like:

```console
source "${HOME}/NAG/RELEASE/scripts/nagvars.sh" int64 vendor static
```

Replace `RELEASE` with the actual installed directory. The source material is
inconsistent: the standalone setup script names `nll6i302bl` and `int32`, while
the wiki names `nll6i311bl` and `int64`. Choose the interface that matches the
installed library and the integer model required by the program.

The wiki also recorded this network-licence setting:

```console
export NAG_KUSARI_FILE='util01:,lic-nag.ucl.ac.uk:'
```

Confirm that this licence server and syntax are still valid. Some installations
instead use a local licence file; never commit an actual licence key.

## Reusable environment script

The original repository's
[`setup-intel-fortran.sh`](../../scripts/condenser/setup-intel-fortran.sh) has
been preserved unchanged. It:

1. removes the shell stack-size limit;
2. loads oneAPI from `${HOME}/intel`;
3. loads a particular NAG library release using the 32-bit integer interface;
   and
4. points NAG at a local licence file.

Treat it as a project-specific example, not a universal setup script. Review
the paths, integer interface, licence method, and effect of
`ulimit -s unlimited` before sourcing it:

```console
source scripts/condenser/setup-intel-fortran.sh
```

## Legacy build configuration

The wiki supplied a Makefile configuration using `ifx`, `icx`, Intel MPI, MKL,
and the NAG static library. The essential relationships were:

```makefile
LOCAL_MPI_FC = mpiifx
LOCAL_MPI_CC = mpiicc

NAGDIR      = $(HOME)/NAG/RELEASE
MKL_INCLUDE = -I$(MKLROOT)/include
NAG_INCLUDE = -I$(NAGDIR)/lp64/include \
              -I$(NAGDIR)/lp64/nag_interface_blocks

LOCAL_CC = icx
LOCAL_FC = ifx
LOCAL_AR = xiar

LOCAL_FL_LIBS = $(NAGLIB_LINK) -shared-intel
LOCAL_CC_LIBS = -ldl -lstdc++
```

Replace `RELEASE` and confirm current MPI wrapper names. The original also used
aggressive, architecture-specific optimisation and deprecated diagnostic
flags. Add compiler flags incrementally after first producing a correct,
portable build.

