# R and RStudio: installation and licence

R is free software distributed under the GNU General Public License. RStudio Desktop Open Source is free and distributed under the GNU Affero General Public License. A UCL licence key is not required for either open-source product.

Install R first, then install RStudio Desktop.

- [Download R from CRAN](https://cran.r-project.org/)
- [Download RStudio Desktop](https://posit.co/downloads)
- [UCL Research Computing R guide](https://www.rc.ucl.ac.uk/docs/Software_Guides/R/)

## Windows

1. Open [CRAN](https://cran.r-project.org/) and choose **Download R for Windows**.
2. Download and run the base R installer.
3. Open [Posit's download page](https://posit.co/downloads) and download RStudio Desktop Open Source for Windows.
4. Run the RStudio installer.
5. Start RStudio. It should locate R automatically.

## macOS

1. Open [CRAN](https://cran.r-project.org/) and choose **Download R for macOS**.
2. Download the installer matching your supported macOS version and processor, then install R.
3. Download RStudio Desktop Open Source from [Posit](https://posit.co/downloads).
4. Open the disk image and move RStudio to Applications.
5. Start RStudio and confirm that its console reports the expected R version.

## Myriad

R is installed centrally. Discover the versions and load the recommended module:

```console
module avail r
module -f unload compilers mpi gcc-libs
module load r/recommended
R --version
```

Use the login node to prepare work and submit jobs, not for substantial computation. A minimal serial job script is:

```bash
#!/bin/bash -l
#$ -l h_rt=0:10:0
#$ -l mem=2G
#$ -l tmpfs=10G
#$ -N r_example
#$ -cwd

module -f unload compilers mpi gcc-libs
module load r/recommended
Rscript analysis.R
```

Submit it with `qsub r-job.sh`. The [official UCL R guide](https://www.rc.ucl.ac.uk/docs/Software_Guides/R/) also covers parallel jobs and user-installed packages.

UCL Economics users can access the [Economics RStudio Server](https://econ-myriad.rc.ucl.ac.uk/auth-sign-in) from a web browser while connected to the UCL network or VPN. This avoids installing RStudio on Myriad and runs the R session on the service.

## Condenser

Ask the VM administrator whether R or RStudio Server is already installed. On an Ubuntu VM, the administrator should use the current CRAN and Posit instructions for that exact Ubuntu release. RStudio Server is a multi-user service and should be installed, secured, updated, and exposed to the network only by the VM administrator.

For command-line work, users can run R without RStudio once R is installed.

## Licences

R and RStudio Desktop Open Source do not require paid UCL licences. R packages have their own licences. RStudio Desktop Pro and Posit Workbench are separate commercial products and are not implied by this guidance.

Last reviewed: 29 September 2026.

