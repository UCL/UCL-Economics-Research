# UCL Data storage

Options in addition to your local machine.

## Quick guide

- **OneDrive:** 100GB of cloud storage, easy to connect to Windows or Mac. Potentially slow
for quick access to large datafiles (say 5GB+).
- **[Research Data Storage Service](https://www.ucl.ac.uk/research-innovation/advanced-research-computing/platforms-and-services/research-data-storage-service):** Up to 1TB storage for active research-project data, large datasets. Managed backup. Controlled project membership for joint projects/confidential data. Can be mounted on any Windows/Mac/Linux machine on UCL's network. 
- **Myriad or Kathleen Scratch:** Default 1TB storage on cluster for files/data needed while running jobs on cluster. Data is not backed up so should be copied to RDSS for backup.

## Detailed guidance

- [UCL OneDrive for Business](https://www.ucl.ac.uk/isd/services/file-storage-sharing/onedrive-business)
- [UCL Research Data Storage Service](https://www.ucl.ac.uk/research-innovation/advanced-research-computing/platforms-and-services/research-data-storage-service)
- [Managing RDSS usage and quota](https://www.ucl.ac.uk/research-innovation/advanced-research-computing/platforms-and-services/research-data-storage-service/managing-your-usage-and-quota-rdss)
- [Myriad quotas](https://www.rc.ucl.ac.uk/docs/Clusters/Myriad/#quotas)
- [UCL Research Computing data management](https://www.rc.ucl.ac.uk/docs/Data_Management/)

## OneDrive for Business at UCL

[UCL OneDrive for Business](https://www.ucl.ac.uk/isd/services/file-storage-sharing/onedrive-business) is personal cloud storage provided through Microsoft 365. It is automatically available to UCL staff and students.

### Best for

- Documents and working files belonging primarily to one person.
- Sharing selected files or folders with UCL colleagues or external collaborators.
- Collaborative editing of Microsoft Office documents.
- Access from different devices without connecting to the UCL VPN.

UCL's current work and study storage pages state that users receive 100 GB. Check the [current UCL storage guidance](https://www.ucl.ac.uk/isd/services/file-storage-sharing/work-storage) before planning a project around a particular quota.

### Access and sharing

Sign in through the UCL Microsoft 365 or OneDrive portal using your UCL account in the form `userID@ucl.ac.uk`. Files are private until you share them. When sharing, choose view or edit permission deliberately and review access periodically.

OneDrive provides version history and recovery tools. UCL states that deleted files can be recovered from the recycle bin for up to 93 days, and that **Restore your OneDrive** can undo actions from the previous 30 days. These features are useful, but they do not replace a research data-management and preservation plan.

### When not to use it

OneDrive is not the best primary store for very large computational datasets, high-throughput cluster I/O, or a project whose access must be administered independently of one person's account. Use RDSS for managed project storage and Myriad Scratch for active cluster computation.

Before storing personal, confidential, or otherwise sensitive data, follow UCL information-governance requirements and confirm that OneDrive is approved for the data classification involved.

## Research Data Storage Service

The [Research Data Storage Service](https://www.ucl.ac.uk/research-innovation/advanced-research-computing/platforms-and-services/research-data-storage-service) is UCL's managed service for storing and sharing data during an active research project.

### Best for

- Research datasets shared by a defined project team.
- Large files or data volumes beyond convenient OneDrive use.
- Projects requiring centrally managed storage and daily backup.
- Access by named UCL members and approved external collaborators.
- Projects that need a space owned and administered by the project rather than by one individual.

### Service features

UCL describes RDSS as project-based storage on UCL-owned UK hardware. Files are mirrored between two data centres and backed up daily. Project PIs or administrators can manage membership and monitor quota through the administration interface.

Current UCL guidance describes an initial 1 TB allocation at no cost. Arrangements for additional capacity can change, so check the service page and discuss large requirements with Research Data Support when planning a project or grant.

RDSS also applies a file-count allowance of 200,000 files per TB. Large collections of tiny files may reach that limit before exhausting the byte quota; packaging suitable files into archives can help.

### Getting access

1. The project's Principal Investigator registers the project.
2. The application identifies administrators, members, dates, expected data volume, and relevant grants.
3. Once approved, named members receive access instructions.
4. Access from outside UCL requires the UCL VPN.

Use the [RDSS administration interface and guidance](https://www.ucl.ac.uk/research-innovation/advanced-research-computing/platforms-and-services/research-data-storage-service) to register a project, manage membership, and check quota.

### Important limitations

RDSS is intended for active research data, not public publication or permanent preservation. Use the UCL Research Data Repository when selected data should be published or preserved beyond the active project.

UCL states that RDSS is not currently certified for highly sensitive data. Do not place unencrypted personally identifiable, special-category, restricted NHS, or similarly controlled data there without confirmation from the appropriate UCL information-governance service. Consider the Data Safe Haven or another approved trusted research environment.

## Myriad Scratch

Myriad provides high-performance storage close to its compute nodes. The [official Myriad guide](https://www.rc.ucl.ac.uk/docs/Clusters/Myriad/#quotas) states that the default quota is 1 TB for a user's home area, which Myriad also treats as scratch.

### Best for

- Input files needed by Myriad jobs.
- Intermediate working files.
- Checkpoints and temporary results produced during computation.
- Outputs waiting to be checked and transferred to an appropriate longer-term store.

Myriad Scratch is part of the computing workflow. It should not be the only location of important source data or final research outputs. Keep authoritative copies in an appropriate managed store such as RDSS, and move valuable results out of Scratch after jobs finish.

### Check your quota

On Myriad, run:

```console
gquota
```

The hard limit prevents further writes. Jobs can fail if they cannot create scheduler output, error, temporary, or result files, so check quota before large runs and clean obsolete files regularly. Additional capacity can be requested through UCL Research Computing's resource-request process.

### Use Scratch in jobs

Create a project working directory under `~/Scratch` and submit jobs from there:

```console
mkdir -p ~/Scratch/my-project
cd ~/Scratch/my-project
qsub job.sh
```

A compute node also provides job-specific temporary space through `$TMPDIR` when requested with the Grid Engine `tmpfs` resource. Use it for high-I/O temporary work, then copy required outputs back to `~/Scratch` before the job ends. Files left only in `$TMPDIR` are not a durable result.

Myriad filesystems are not approved for special-category data. See the [UCL Research Computing data-management guidance](https://www.rc.ucl.ac.uk/docs/Data_Management/) before moving sensitive data to a cluster.

## Recommended workflow

1. Keep the managed project copy of substantial research data in RDSS.
2. Copy only the files required for a computation to Myriad Scratch.
3. Run jobs using Scratch and `$TMPDIR` as appropriate.
4. Check and transfer valuable outputs back to RDSS.
5. Use OneDrive for documents, small working files, and collaboration when its sharing model and data classification are suitable.
6. Plan separately for publication or long-term preservation at the end of the project.

Last reviewed: 29 September 2026.

