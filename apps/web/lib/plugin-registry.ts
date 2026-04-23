// In-memory registry for plugin-registered admin pages
// This is a server-side singleton

interface PluginAdminPage {
  pluginId: string;
  path: string;      // e.g. '/admin/plugins/my-plugin/settings'
  label: string;
  icon?: string;
}

class PluginRegistry {
  private pages: PluginAdminPage[] = [];

  registerAdminPage(page: PluginAdminPage): void {
    this.pages.push(page);
  }

  getPages(): PluginAdminPage[] {
    return [...this.pages];
  }

  clear(): void {
    this.pages = [];
  }
}

export const pluginRegistry = new PluginRegistry();
