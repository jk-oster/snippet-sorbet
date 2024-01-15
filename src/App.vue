<script setup lang="ts">
import { languageInterpreterService } from './language.ts';
import { onMounted, ref } from 'vue';
import Output from './components/Output.vue';

// initialize codemirror and pass configuration to support Python and the dracula theme

type OutputItem = {
  content: string;
  type?: string;
}

const output = ref([] as OutputItem[]);

// @ts-ignore
let editor: any = null;

const codeMirrorInit = () => {
  // @ts-ignore
  editor = CodeMirror.fromTextArea(
    document.getElementById("code"), {
    mode: {
      name: "python",
      version: 3,
      singleLineStringErrors: false,
    },
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
  }
  )
}

const clearHistory = () => {
  // @ts-ignore
  output.value = [];
};

const run = () => {
  languageInterpreterService.run(editor?.getValue() ?? '');
};

const setLang = (event: any) => {
  console.log(event.target.value);
  languageInterpreterService.setLanguage(event.target.value);
};

const scrollToBottom = () => {

  // wait for the DOM to update
  // @ts-ignore
  this.$nextTick(() => {
    // @ts-ignore
    const element = document.getElementById('output');
    element?.scroll({ top: element?.scrollHeight ?? 0, behavior: "smooth" })
  });
}

onMounted(() => {
  languageInterpreterService.init();
  codeMirrorInit();
  window.addEventListener('lang:output', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'output' }];
    scrollToBottom();
    console.log(output.value);
  });

  window.addEventListener('lang:ready', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'ready' }];
    scrollToBottom();

    console.log(output.value);
  });

  window.addEventListener('lang:changed', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'change' }];
    scrollToBottom();

    console.log(output.value);
  });

  window.addEventListener('lang:error', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'error' }];
    scrollToBottom();

    console.log(output.value);
  });
});

</script>

<template>
  <div class="bg-slate-900 h-screen mt-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-slate-200 text-3xl my-4 font-extrabold mx-2 pt-8">Snippet Sorbet</h1>
    <p class="text-slate-200 text-lg my-4 mx-2 font-bold">A simple code snippet runner. Run Python / PHP (and ofc
      JavaScript) in your browser</p>

    <div class="h-3/4 flex flex-row mb-8">
      <div class="grid w-2/3 border-dashed border-2 border-slate-500 mx-2">
        <textarea id="code" name="code" class="h-full"></textarea>
      </div>
      <div class="w-1/3 border-dashed border-2 border-slate-500 mx-2 h-full">
        <div>
          <button @click="run()" type="button"
            class="mx-2 my-4 h-12 px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm bg-green-700 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 text-slate-300">Run</button>
          <button @click="clearHistory()" type="button"
            class="mx-2 my-4 h-12 px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 text-slate-300">Clear
            History</button>
          <select @change="setLang"
            class="mx-2 my-4 h-12 px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm bg-slate-900 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-slate-300">
            <option selected value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="php">PHP</option>
          </select>
        </div>
        <div class="p-8 text-slate-200 bg-slate-900 h-5/6 overflow-auto" id="output">
          <template v-for="item in output">
            <Output :output="item?.content" :type="item?.type"></Output>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}


@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }

  a:hover {
    color: #747bff;
  }

  button {
    background-color: #f9f9f9;
  }
}
</style>
