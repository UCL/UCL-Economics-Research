# Stata: installation and licence

Stata is proprietary software. UCL's Software Database lists Stata for staff and student home use. Download the installer and obtain the current UCL licence details from the Software Database; do not copy licence codes into documentation, email, or public repositories.

- [UCL Software Database](https://swdb.ucl.ac.uk/)
- [Official Stata installation guide](https://www.stata.com/install-guide/)

## Windows and macOS

1. Sign in to the [UCL Software Database](https://swdb.ucl.ac.uk/) with your UCL user ID.
2. Open the Stata entry and read the current eligibility and usage terms.
3. Download the installer and the licence or activation information supplied by UCL.
4. Check whether the licence is for Stata/MP, Stata/SE, or Stata/BE, and install that same edition.
5. Run the installer and keep the default installation location unless you have a reason to change it.
6. Start Stata and import the supplied `.stcodes` file or enter the serial number, code, and authorization exactly as supplied.
7. Allow Stata to check for official updates.

The Windows and macOS screens differ, but both require the installer and matching licence details. See Stata's [platform-specific installation guide](https://www.stata.com/install-guide/) if a screen or option is unclear.

If the UCL download or licence information is unavailable, contact [MyServices](https://myservices.ucl.ac.uk/self-service). Do not purchase a personal licence before checking UCL access.

## Myriad

Stata is already installed centrally. List the available modules:

```console
module avail stata
```

Load an available version:

```console
module load stata
```

Do not run substantial analysis on a login node. Submit a batch job through Sun Grid Engine. For a do-file called `analysis.do`:

```bash
#!/bin/bash -l
#$ -l h_rt=0:10:0
#$ -l mem=2G
#$ -l tmpfs=10G
#$ -pe smp 1
#$ -N stata_example
#$ -cwd

module load stata
stata-mp -b do analysis.do
```

The executable may be named differently for the installed edition. After loading the module, use `which stata-mp`, `which stata-se`, or `which stata` to confirm it. Submit with `qsub stata-job.sh`.

For brief interactive work, request a compute-node session with `qrsh` before starting terminal Stata. Graphical Stata additionally requires X11 forwarding.

## Condenser

Stata is not automatically available on every Condenser VM. Ask the VM administrator before installation. A Linux installation requires suitable installation media, administrator access, and a licence that permits use on that VM. Obtain current UCL licence advice through the Software Database or MyServices rather than reusing personal activation details without confirmation.

## Licence

UCL's home-use entitlement is subject to the terms shown in the Software Database. The installer edition must match the supplied licence, and licence credentials must be kept private.

Last reviewed: 29 September 2026.

