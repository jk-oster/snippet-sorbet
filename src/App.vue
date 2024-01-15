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

onMounted(() => {
  languageInterpreterService.init();
  codeMirrorInit();
  window.addEventListener('lang:output', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'output'}];
    console.log(output.value);
  });

  window.addEventListener('lang:ready', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'ready'}];
    console.log(output.value);
  });

  window.addEventListener('lang:changed', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'change'}];
    console.log(output.value);
  });

  window.addEventListener('lang:error', (event) => {
    // @ts-ignore
    output.value = [...output.value, { content: event.detail, type: 'error'}];
    console.log(output.value);
  });
});

</script>

<template>
  <div class="bg-slate-900 h-screen mt-0 w-full overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
    <p class="text-slate-200 text-3xl my-4 font-extrabold mx-2 pt-8">Run Python / PHP / JavaScript in your browser</p>
    <div class="h-3/4 flex flex-row">
      <div class="grid w-2/3 border-dashed border-2 border-slate-500 mx-2">
        <!-- our code editor, where codemirror renders it's editor -->
        <textarea id="code" name="code" class="h-full"></textarea>
      </div>
      <div class="grid w-1/3 border-dashed border-2 border-slate-500 mx-2">
        <!-- output section where we show the stdout of the python code execution -->
        <div class="p-8 text-slate-200 bg-slate-900">
          <template v-for="item in output">
            <Output :output="item?.content" :type="item?.type"></Output>
          </template>
        </div>
      </div>
    </div>
    <!-- run button to pass the code to pyodide.runPython() -->
    <button @click="run()" type="button"
      class="mx-2 my-4 h-12 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-green-700 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 text-slate-300">Run</button>
    <!-- clean the output section -->
    <button @click="clearHistory()" type="button"
      class="mx-2 my-4 h-12 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 text-slate-300">Clear
      History</button>
    <select @change="setLang" class="mx-2 my-4 h-12 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-slate-900 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-slate-300">
      <option selected value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="php">PHP</option>
    </select>
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

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.card {
  padding: 2em;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
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
