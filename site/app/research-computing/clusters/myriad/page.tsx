import type { Metadata } from 'next';
import { ResearchComputingPage } from '@/components/research-computing-page';

export const metadata: Metadata = { title: 'Using Myriad or Kathleen | Research Computing | UCL Economics Research' };

const Code = ({ children }: { children: string }) => <pre><code>{children}</code></pre>;

export default function Page() {
  return (
    <ResearchComputingPage active="Clusters" heading="Using Myriad or Kathleen">
      <article className="research-computing-guide">
        <p>Myriad is UCL&apos;s Linux-based high-performance computing cluster. This page covers the Economics access point and a few common tasks.</p>
        <blockquote>Verify details against the <a href="https://www.rc.ucl.ac.uk/docs/">official Myriad documentation</a> before relying on them.</blockquote>

        <h3>Before you connect</h3>
        <p>You need a cluster account <a href="https://signup.rc.ucl.ac.uk/computing/requests/new">(account application).</a> When away from the UCL network, connect to the UCL VPN first.</p>
        <p>Common ways to use Myriad include:</p>
        <ol><li>SSH for command-line tools such as Stata, R, and MATLAB.</li><li>SFTP for transferring files.</li><li>The Economics RStudio Server in a web browser.</li></ol>

        <h3>Connect with SSH</h3>
        <p>Replace <code>username</code> with your UCL username:</p>
        <Code>{'ssh -X username@econ-myriad.rc.ucl.ac.uk'}</Code>
        <p>The <code>-X</code> option enables X11 forwarding for graphical applications. It requires an X server on your computer and is unnecessary for command-line work.</p>
        <p>End the session with:</p>
        <Code>{'exit'}</Code>

        <h3>Use RStudio Server</h3>
        <p>After connecting to the UCL network or VPN, open the <a href="https://econ-myriad.rc.ucl.ac.uk/auth-sign-in">Economics RStudio Server</a>. Try a supported browser other than Safari if sign-in does not work.</p>

        <h3>Transfer files with SFTP</h3>
        <p>Start SFTP on your own computer:</p>
        <Code>{'sftp username@econ-myriad.rc.ucl.ac.uk'}</Code>
        <p>Useful commands within the SFTP prompt include:</p>
        <Code>{`lcd local-directory       # change directory on your computer
cd remote-directory       # change directory on Myriad
put file.R                # upload one file
get results.txt           # download one file
exit                      # close the SFTP session`}</Code>
        <p>Confirm that the destination is appropriate for the data before transferring it. In particular, do not move sensitive or restricted data without checking the applicable UCL data-management rules.</p>

        <h3>Transfer data from RDSS</h3>
        <p>The Research Data Storage Service (RDSS) is documented on the <a href="https://www.ucl.ac.uk/advanced-research-computing/platforms-services/research-data-storage-service">official RDSS service page</a>. From a Myriad session, the broad workflow is:</p>
        <Code>{`mkdir -p Scratch/project-data
cd Scratch/project-data
sftp live.rd.ucl.ac.uk`}</Code>
        <p>At the SFTP prompt, change to your project&apos;s RDSS directory and use <code>get</code> to download the required file. Project paths are specific to each allocation; do not copy example project identifiers into your own commands.</p>

        <h3>Request an interactive compute session</h3>
        <p>Do not run computational work on a login node. To launch an interactive job with 24 hours and 4 GB of memory:</p>
        <Code>{'qrsh -l h_rt=24:0:0,mem=4G'}</Code>
        <p>Requested resources should match the job. The job may wait in a queue until capacity is available. Check the current scheduler guidance and limits in the <a href="https://www.rc.ucl.ac.uk/docs/">official Myriad documentation</a>.</p>

        <h3>Start Stata interactively</h3>
        <p>After obtaining an interactive compute session:</p>
        <Code>{`module load stata
xstata`}</Code>
        <p><code>xstata</code> needs working X11 forwarding. For command-line or unattended work, use Stata&apos;s batch mode instead; a tested batch example is still to be added.</p>

        <h3>Basic Linux commands</h3>
        <Code>{`pwd                       # show the current directory
ls                        # list its contents
cd directory              # change directory
mkdir directory           # create a directory
cp source destination     # copy a file
mv source destination     # move or rename a file`}</Code>
        <p>Be cautious with deletion commands: deletion on a remote Linux system may not be recoverable.</p>

        <h3>Further details</h3>
        See <a href="https://www.rc.ucl.ac.uk/docs/">official Myriad documentation</a>.
        <p><em>Last reviewed: 29 September 2026.</em></p>
      </article>
    </ResearchComputingPage>
  );
}
