# MATLAB: installation and licence

UCL staff and students can use MATLAB and its toolboxes for academic and teaching work, including installation on a personal computer. UCL describes this as its Total Academic Headcount (TAH) licence.

- [UCL MATLAB TAH licence](https://www.ucl.ac.uk/isd/services/software-hardware/software-licence-agreements/matlab-tah-licence)
- [UCL Software Database](https://swdb.ucl.ac.uk/)
- [MathWorks Campus-Wide licence instructions](https://www.mathworks.com/help/install/license/provide-access-to-mathworks-products-for-campus-wide-license-users.html)

## Windows and macOS

The installation process is essentially the same on both platforms.

1. Go to the [UCL Software Database](https://swdb.ucl.ac.uk/) or the [MathWorks MATLAB access page](https://www.mathworks.com/academia/tah-support-program/eligibility.html).
2. Sign in or create a MathWorks Account using your UCL email address. Use your institutional sign-in when prompted.
3. Choose **Install MATLAB** and download the installer for Windows or macOS.
4. Run the installer and sign in with the same MathWorks Account.
5. When asked to choose a licence, select the UCL campus-wide individual licence. MathWorks may describe it as **MATLAB (Individual)** or **Academic — Total Headcount**.
6. Select MATLAB and the toolboxes you need, then complete installation and activation.
7. Start MATLAB. The first launch may ask you to sign in again.

Only install toolboxes you expect to use; the complete collection is large. You can add another toolbox later from MATLAB's Add-Ons interface.

If your UCL account is not associated with the licence, or activation fails, use [MyServices](https://myservices.ucl.ac.uk/self-service) for support.

## Myriad: no installation required

MATLAB and the licensed UCL toolboxes are already installed on Myriad. Do not download your own copy to the cluster.

After connecting to Myriad, list the installed versions:

```console
module avail matlab
```

Load the version you need. For example, the current UCL Research Computing guide uses:

```console
module load xorg-utils/X11R7.7
module load matlab/full/r2021a/9.10
```

The versions available on Myriad can change. Use the result of `module avail matlab`, and use the same module consistently throughout a project.

The first time you use MATLAB on Myriad, load the module once on a login node. The UCL setup configures MATLAB's settings directory so compute nodes can write to it.

## Do not run substantial MATLAB work on a login node

Myriad's login nodes are for connecting, preparing files, and submitting or monitoring jobs. Run calculations on compute nodes through Sun Grid Engine.

### Submit a batch job

First create a directory in Scratch and put your MATLAB program there. This example assumes the program is called `analysis.m`.

```console
mkdir -p ~/Scratch/matlab-example
cd ~/Scratch/matlab-example
```

Create a Grid Engine job script called `matlab-job.sh`:

```bash
#!/bin/bash -l

#$ -l h_rt=0:10:0
#$ -l mem=2G
#$ -l tmpfs=10G
#$ -pe smp 1
#$ -l matlab=1
#$ -N matlab_example
#$ -cwd

module load xorg-utils/X11R7.7
module load matlab/full/r2021a/9.10

matlab -nosplash -nodesktop -nodisplay -singleCompThread < analysis.m
```

Change the requested runtime, memory, temporary storage, number of cores, and MATLAB module to suit your work. If you request more than one core with `-pe smp`, make sure your MATLAB code can actually use them.

Submit the job from the Scratch directory:

```console
qsub matlab-job.sh
```

Check its status with:

```console
qstat
```

Standard output and errors will be written to files in the submission directory. The [official UCL MATLAB guide](https://www.rc.ucl.ac.uk/docs/Software_Guides/Matlab/#single-node-multi-threaded-batch-jobs) provides a fuller job script, including copying input and output through the compute node's temporary directory.

### Use MATLAB interactively on a compute node

For short interactive tests, first request an interactive Grid Engine session rather than starting substantial work on the login node. After the interactive session starts, load the same MATLAB module and run the terminal interface:

```console
qrsh -pe smp 1 -l mem=2G,h_rt=0:30:0 -now no
```

Once the scheduler gives you a compute-node shell:

```console
module load xorg-utils/X11R7.7
module load matlab/full/r2021a/9.10
matlab -nodesktop -nodisplay
```

The graphical interface requires an X11-capable connection. See the [official interactive-job guide](https://www.rc.ucl.ac.uk/docs/Interactive_Jobs/) and [interactive MATLAB guidance](https://www.rc.ucl.ac.uk/docs/Software_Guides/Matlab/#using-the-matlab-gui-interactively) for current connection requirements.

## Submit Myriad jobs from MATLAB on your computer

It is possible to work in MATLAB on your Windows or macOS computer while sending computational jobs to Myriad through MATLAB Parallel Server.

Before configuring this workflow, you need:

1. A Myriad account and a working Myriad login.
2. Access to the UCL network, or the UCL VPN when working remotely.
3. MATLAB and Parallel Computing Toolbox installed locally.
4. A local MATLAB release that matches a release supported for remote submission on Myriad.
5. A dedicated job-storage directory in `~/Scratch` on Myriad.

The setup uses UCL's Myriad cluster profile and support files. From local MATLAB you then create a Myriad cluster object, set the required Grid Engine resources, submit the job, and retrieve its results through MATLAB's Job Monitor.

The support files and profile are release-specific. The UCL page currently gives detailed instructions for particular MATLAB releases, so do not substitute a newer release without checking compatibility. Follow [Submitting MATLAB jobs from your workstation or laptop](https://www.rc.ucl.ac.uk/docs/Software_Guides/Matlab/#submitting-matlab-jobs-from-your-workstationlaptop) for the supported versions, downloads, setup steps, resource settings, and troubleshooting.

## Condenser

MATLAB is not automatically available on every Condenser virtual machine. Before installing it, ask the VM administrator whether MATLAB is already installed and whether that VM is intended to run licensed software.

If installation is appropriate, use the UCL campus-wide licence and the MathWorks Linux installer. Installation and licence configuration on a shared or server-style VM may differ from a personal installation, so the VM owner should confirm the licensing method and installation location. Use [MyServices](https://myservices.ucl.ac.uk/self-service) if licence or activation support is required.

## Authoritative guidance

- [UCL Research Computing MATLAB guide](https://www.rc.ucl.ac.uk/docs/Software_Guides/Matlab/)
- [UCL MATLAB TAH licence](https://www.ucl.ac.uk/isd/services/software-hardware/software-licence-agreements/matlab-tah-licence)
- [MathWorks Campus-Wide licence instructions](https://www.mathworks.com/help/install/license/provide-access-to-mathworks-products-for-campus-wide-license-users.html)

Last reviewed: 29 September 2026.
