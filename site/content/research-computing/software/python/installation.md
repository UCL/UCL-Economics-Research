# Python: installation and licence

Python is free and open-source software distributed under the Python Software Foundation licence. No UCL licence or activation key is required.

- [Download Python](https://www.python.org/downloads/)
- [Official Python documentation](https://docs.python.org/3/)
- [Python licence](https://docs.python.org/3/license.html)

## Windows

The official Python documentation recommends the Python Install Manager.

1. Download it from [python.org](https://www.python.org/downloads/) or install it from Microsoft Store.
2. Complete the per-user installation.
3. Open a new terminal and check Python:

```console
python --version
```

4. Create a separate virtual environment for each project:

```console
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
```

## macOS

Download the current supported macOS installer from [python.org](https://www.python.org/downloads/) and run it. Avoid changing or removing the Python installation supplied by macOS.

Check the installation and create a project environment:

```console
python3 --version
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Use `python` while the environment is active. Keep project dependencies in that environment rather than installing packages globally.

## Myriad

Use a centrally installed module rather than the operating system Python:

```console
module avail python
module load python3
python --version
```

The exact module name can change, so use a name shown by `module avail python`. Create a virtual environment for the project in an appropriate persistent location:

```console
python -m venv ~/Scratch/my-project/.venv
source ~/Scratch/my-project/.venv/bin/activate
python -m pip install --upgrade pip
```

Use the same module whenever you activate that environment. Do not run substantial computation on a login node. Submit Python programs to Sun Grid Engine:

```bash
#!/bin/bash -l
#$ -l h_rt=0:10:0
#$ -l mem=2G
#$ -l tmpfs=10G
#$ -pe smp 1
#$ -N python_example
#$ -cwd

module load python3
source ~/Scratch/my-project/.venv/bin/activate
python analysis.py
```

Submit with `qsub python-job.sh`. Confirm the current module name before using the example.

## Condenser

Ubuntu normally provides Python 3. Ask the VM administrator before changing the system installation. For project work, create a virtual environment:

```console
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

If `venv` or development headers are missing, ask the administrator to install the relevant Ubuntu packages. Do not use `sudo pip` or replace the system Python.

## Licence

Python itself does not require a UCL licence. Third-party packages have their own licences, which must be checked when redistribution or commercial use matters.

Last reviewed: 29 September 2026.

