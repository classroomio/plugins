import { createPublicLandingRendererClient } from "@classroomio/plugin-sdk";
import type { PublicLandingPageViewModel } from "@classroomio/plugin-sdk";

const client = createPublicLandingRendererClient();

export function requestNavigation(
  href: string,
  disposition: "self" | "new-tab" = "self",
) {
  client.navigate(href, disposition);
}

export function requestAuth() {
  client.requestAuthentication();
}

export function sendResize(height: number) {
  client.resize(height);
}

export function initLandingBridge(callbacks: {
  onViewModel: (viewModel: PublicLandingPageViewModel) => void;
}): () => void {
  void client
    .getContext()
    .then((context) => callbacks.onViewModel(context.viewModel));
  return client.onViewModelChange(callbacks.onViewModel);
}
