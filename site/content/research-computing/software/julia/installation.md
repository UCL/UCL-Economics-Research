# Julia: installation and licence

Julia is free and open-source software distributed under the MIT licence. No UCL licence or activation key is required.

- [Official Julia installation instructions](https://docs.julialang.org/en/v1/manual/installation/)
- [Julia downloads](https://julialang.org/downloads/)
- [Julia licence](https://github.com/JuliaLang/julia/blob/master/LICENSE.md)

## Windows

The Julia project recommends Juliaup, which installs Julia, manages versions, and configures the command line.

1. Open Microsoft Store and install **Julia**, or open a terminal and run:

```powershell
winget install --name Julia --id 9NJNWW8PVKMN -e -s msstore
```

2. Open a new terminal and start Julia:

```console
julia
```

3. Check the version inside Julia:

```julia
versioninfo()
```

## macOS

Install Juliaup from Terminal:

```console
curl -fsSL https://install.julialang.org | sh
```

Open a new Terminal window and start Julia:

```console
julia
```

The official macOS disk image is an alternative if Juliaup is unsuitable.

## Myriad

Do not install a separate system copy of Julia. Check whether an appropriate module is already available:

```console
module avail julia
```

Load one of the versions shown, replacing the example module name with an available version:

```console
module load julia
julia --version
```

Use the login node only to inspect modules, prepare files, and submit jobs. Run substantial Julia calculations on compute nodes through Sun Grid Engine. A minimal job script is:

```bash
#!/bin/bash -l
#$ -l h_rt=0:10:0
#$ -l mem=2G
#$ -l tmpfs=10G
#$ -pe smp 1
#$ -N julia_example
#$ -cwd

module load julia
julia analysis.jl
```

Submit it from a directory in Scratch with `qsub julia-job.sh`. Confirm the current module name on Myriad before using this example.

## Condenser

First ask the VM administrator whether Julia is already installed. For a personal user-space installation on a suitable VM, Juliaup is the recommended upstream method and does not require a UCL licence. For a shared installation, the VM administrator should choose and maintain the version.

## Licence

Julia's MIT licence permits academic and commercial use. Individual Julia packages have their own licences, so check package terms when redistribution or commercial use matters.

Last reviewed: 29 September 2026.

