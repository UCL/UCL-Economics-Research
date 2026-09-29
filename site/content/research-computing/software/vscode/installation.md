# VS Code: installation and licence

Visual Studio Code is available for Windows, macOS, and Linux. The Microsoft distribution is free to use under the Visual Studio Code product licence; its open-source code is published separately under the MIT licence. No UCL licence key is required for the core editor.

- [Download VS Code](https://code.visualstudio.com/download)
- [Official setup guide](https://code.visualstudio.com/docs/setup/setup-overview)
- [VS Code licence](https://code.visualstudio.com/license)

## Windows

1. Download the **User Installer** from the official VS Code site.
2. Run the installer. The per-user installation normally does not require administrator access.
3. Open VS Code.
4. Open a new terminal and confirm the command-line launcher works:

```console
code .
```

If `code` is not found, restart the terminal after installation.

## macOS

1. Download the macOS build suitable for your Mac.
2. Open the downloaded archive or disk image.
3. Move **Visual Studio Code.app** to Applications and start it.
4. To enable the terminal command, open the Command Palette and run **Shell Command: Install 'code' command in PATH**.
5. Open a new Terminal window and test:

```console
code .
```

## Myriad

Normally, install and run VS Code on your own computer, not on a Myriad login or compute node. Use VS Code's Remote - SSH extension to edit files through an SSH connection where permitted.

Install the extension locally, establish normal command-line access to Myriad first, and then connect using the same SSH host entry. Remote extensions may install small server-side components in your account. Check current UCL Research Computing policy and storage limits before using remote tooling.

Do not use a VS Code remote terminal to bypass Sun Grid Engine. Computational work must still be submitted to compute nodes with `qsub` or started in an allocated interactive session.

## Condenser

The recommended arrangement is also to run VS Code locally and connect to the VM using Remote - SSH. Confirm that ordinary SSH access works before configuring VS Code.

Installing the full graphical editor inside a VM is usually unnecessary. If a server-side or shared installation is proposed, the VM administrator should review security, updates, extensions, and network exposure.

## Extensions and additional licences

VS Code extensions are separate software and can have different licences and data-handling terms. Install only extensions you need, prefer trusted publishers, and review permissions—especially for extensions that send code or data to an external service.

GitHub Copilot and other paid or AI-assisted services are not included merely because VS Code is free; their eligibility, subscription, and data-use terms must be considered separately.

Last reviewed: 29 September 2026.

