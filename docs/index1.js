import { W as WebApp$1 } from "./WebApp.js";
import { _ as _imports_0 } from "./logo.js";
import { p as pushScopeId, a as popScopeId, i as inject, o as openBlock, c as createBlock, b as createVNode, t as toDisplayString, u as unref, F as Fragment, r as reactive, d as readonly } from "./vendor.js";
/* empty css     */var NetworkedHelloWorld_vue_vue_type_style_index_0_scoped_true_lang = "\na[data-v-167fde6a] {\n  color: #b542b9;\n}\n.fade[data-v-167fde6a] {\n  color: #9803a5;\n  /* transition: color 1s; */\n}\n.fade[data-v-167fde6a]:hover {\n  color: #a78e06;\n}\n";
pushScopeId("data-v-167fde6a");
const _hoisted_1$1 = {
  "xr-layer": "",
  class: "fade"
};
const _hoisted_2$1 = /* @__PURE__ */ createVNode("p", null, " Here's some more text just to make things not blank. ", -1);
popScopeId();
const _sfc_main$1 = {
  expose: [],
  props: {
    msg: String
  },
  setup(__props) {
    const shared = inject("shared");
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Fragment, null, [
        createVNode("h1", _hoisted_1$1, toDisplayString(__props.msg), 1),
        _hoisted_2$1,
        createVNode("button", {
          "xr-layer": "",
          onClick: _cache[1] || (_cache[1] = (...args) => unref(shared).increment && unref(shared).increment(...args))
        }, "count is: " + toDisplayString(unref(shared).state.count), 1)
      ], 64);
    };
  }
};
_sfc_main$1.__scopeId = "data-v-167fde6a";
var App_vue_vue_type_style_index_0_scoped_true_lang = "\n";
pushScopeId("data-v-6b7e979c");
const _hoisted_1 = { id: "top" };
const _hoisted_2 = /* @__PURE__ */ createVNode("img", {
  alt: "Vue logo",
  src: _imports_0
}, null, -1);
popScopeId();
const _sfc_main = {
  expose: [],
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock("div", _hoisted_1, [
        _hoisted_2,
        createVNode(_sfc_main$1, { msg: "Networked Vue Component with Shared Button Count" })
      ]);
    };
  }
};
_sfc_main.__scopeId = "data-v-6b7e979c";
class Store {
  constructor(app2) {
    this._state = reactive({
      count: 0
    });
    this.app = app2;
    this.state = readonly(this._state);
  }
  increment() {
    if (this.app.takeOwnership()) {
      this._state.count++;
      this.app.setSharedData(this.state);
    }
  }
  updateSharedData(dataObject) {
    this._state.count = dataObject.count;
  }
}
class WebApp extends WebApp$1 {
  constructor() {
    super(_sfc_main, 400, 475);
    this.shared = new Store(this);
    this.vueApp.provide("shared", this.shared);
    console.log(JSON.stringify(this.shared.data));
  }
}
let app = new WebApp();
app.mount();
app.vueApp.$el.style.border = "solid 0.1em";
