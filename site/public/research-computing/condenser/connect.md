# Connect to a Condenser virtual machine

This guide describes the two-stage SSH connection to a VM through the
Condenser gateway.

> **Needs service-owner review:** migrated from the Economics-HPC wiki on
> 4 September 2026. Confirm the certificate lifetime, usernames, hostnames, and
> access process with the [official Condenser documentation](https://condenser.arc.ucl.ac.uk/).

## What you need

- Access to Condenser and to the target VM
- The target VM's IP address, supplied by its administrator
- An SSH key on the computer from which you will connect
- Access to the UCL network or VPN, if required by the service

## 1. Create an SSH key if necessary

If you already have an appropriate SSH key, continue to the next section.
Otherwise, follow GitHub's platform-specific guide to
[generate a new SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

An SSH key identifies a particular client device. Never share its private key.
Each additional device should have its own key.

## 2. Obtain a Condenser SSH certificate

Open the [Condenser SSH Certificate Portal](https://ssh.condenser.arc.ucl.ac.uk/),
generate a certificate, and save it locally as:

```text
~/.ssh/id_condenser.signed
```

The migrated wiki stated that certificates expire after seven days. This
expiry period needs confirmation.

Protect the certificate file so only your user can read it:

```console
chmod 600 ~/.ssh/id_condenser.signed
```

## 3. Configure the gateway

Add the following entry to `~/.ssh/config`:

```sshconfig
Host condenser
  HostName ssh.condenser.arc.ucl.ac.uk
  User cloud-user
  CertificateFile ~/.ssh/id_condenser.signed
  IdentityFile ~/.ssh/id_ed25519
```

If your private key is not named `id_ed25519`, change `IdentityFile` to its
actual path. Then protect the configuration file:

```console
chmod 600 ~/.ssh/config
```

## 4. Connect to the VM

Replace `VM_IP_ADDRESS` with the address supplied by the administrator:

```console
ssh -J condenser ubuntu@VM_IP_ADDRESS
```

The VM username may differ from `ubuntu`; confirm it with the administrator.

## Troubleshooting

- **Certificate expired:** return to the certificate portal and generate a new
  certificate.
- **Private key not found:** correct the `IdentityFile` path in SSH config.
- **Permission denied:** ask the VM administrator to confirm that your public
  key and account are authorised.
- **Connection timeout:** check the UCL network or VPN connection and confirm
  that the VM is running.

Last reviewed: migration review pending.
