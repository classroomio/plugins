# LinkedIn Certificate Sharing

The official LinkedIn Certificate Sharing plugin adds an **Add to LinkedIn** action to completed certificates.

## Runtime model

This plugin is a host-rendered declarative contribution. It ships no HTML, JavaScript, iframe, or backend and cannot import ClassroomIO application code.

The manifest contributes one `openUrl` action to `certificate.actions`. ClassroomIO renders the native button only for an active, approved installation and restricts navigation to the declared `https://www.linkedin.com` origin.

## Permissions and data

The plugin requests no permissions and stores no customer data. LinkedIn now uses a static Add-to-Profile flow and asks the learner to enter certification details on LinkedIn, so the plugin does not receive course, organization, learner, or certificate data.

## Lifecycle

- Installation grants the empty permission set and activates the contribution.
- Disabling, revoking, or uninstalling the installation removes the contribution.
- Version `1.0.0` has no runtime artifact because the contribution is entirely declarative.
