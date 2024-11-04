import plugin from "../plugin.json";

let AppSettings = acode.require("settings");
class AcodePlugin {
  async init() {

    let acodeLanguageClient = acode.require("acode-language-client");

    if (acodeLanguageClient) {

      await this.setupLanguageClient(acodeLanguageClient);
    } else {
      window.addEventListener("plugin.install", ({ detail }) => {
        if (detail.name === "acode-language-client") {
          acodeLanguageClient = acode.require("acode-language-client");
          this.setupLanguageClient(acodeLanguageClient);
        }
      });
    }
  }
  get settings() {
    // UPDATE SETTING SAAT RESTART ACODE
    if (!window.acode) return this.defaultSettings;
    let value = AppSettings.value[plugin.id];
    if (!value) {
      //Menjadikan Method defaultSettings sebagai nilai Default
      value = AppSettings.value[plugin.id] = this.defaultSettings;
      AppSettings.update();
    }
    return value;
  }
  get settingsMenuLayout() {
    return {
      list: [
        {
          index: 0,
          key: "serverPath",
          promptType: "text",
          prompt: "Change the serverPath before running.",
          text: "Golang Executable File Path",
          value: this.settings.serverPath,
        },
        {
          index: 1,
          key: "arguments",
          promptType: "text",
          info:"For multiple arguments, please use comma ','\r\nExample: --stdio, -v, -vv",
          prompt: "Argument Of Language Server",
          text: "Argument",
          value: this.settings.arguments.join(", ")
        },
      ],

      cb: (key, value) => {
        switch(key){
          case 'arguments':
            value = value.split(",").map(item => item.trim());
            break;
        }
        AppSettings.value[plugin.id][key] = value;
        AppSettings.update();
      },
    };
  }
  
  get defaultSettings() {
    return {
      serverPath: "gopls",
      arguments: ["-v","serve"],
      languageClientConfig: {}
    };
  }

  async setupLanguageClient(acodeLanguageClient) {
    let socket = acodeLanguageClient.getSocketForCommand(
      this.settings.serverPath,
      this.settings.arguments,
    );
    let golangClient = new acodeLanguageClient.LanguageClient({
      type: "socket",
      socket,
    });
  
    acodeLanguageClient.registerService(
      "golang|go",
      golangClient,
      this.settings.languageClientConfig
    );
    acode.registerFormatter(plugin.name, ["golang", "go"], () =>
      acodeLanguageClient.format(),
    );
  }

  async destroy() {
    if(AppSettings.value[plugin.id]){
      delete AppSettings.value[plugin.id];
      AppSettings.update();
    }
  }
}

if (window.acode) {

  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(
    plugin.id,
    async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      acodePlugin.baseUrl = baseUrl;
      await acodePlugin.init($page, cacheFile, cacheFileUrl);
    },
    acodePlugin.settingsMenuLayout,
  );

  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });

}
