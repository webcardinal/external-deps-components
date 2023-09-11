const template = document.createElement('template');

template.innerHTML = `
<style>
.tabs {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}

.tabs ::slotted(div[slot="tab"]) {
    user-select: none;
    cursor: pointer;
    background-color: #51AE8F;
    font-size: 1rem;
    color: white;
    flex-grow: 1;
    text-align: center;
    line-height: 1.5;
}

.tabs ::slotted(div[slot="tab"].selected) {
    background-color: #328569;
}

.tab-contents ::slotted(*) {
    display: none;
}

.tab-contents ::slotted(.selected) {
    display: block;
    padding: 5px;
}

</style>
 <div class="tabs">
    <slot id="tab-slot" name="tab" class="tab-header"></slot> 
 </div>
 <div class="tab-contents">
    <slot id="content-slot" name="content"></slot>
 </div>
`;

export default class WebcTabNavigator extends HTMLElement {
  _selectedTabIndex = "0";
  _direction = "row";

  constructor() {
    super();
    this.bind(this);
    this.render();
    this.cacheDom();
    this.attachEvents();
    this.setAttribute("selectedTabIndex", this._selectedTabIndex);
    this.dom.tabs[this._selectedTabIndex]?.classList.add("selected");
    this.dom.contents[this._selectedTabIndex]?.classList.add("selected");
    this.dom.tabs.forEach(tabItem => {
      tabItem.style.maxWidth = `${100 / this.dom.tabs.length}%`
    })
  }

  bind(element) {
    element.render = element.render.bind(element);
    element.attachEvents = element.attachEvents.bind(element);
    element.cacheDom = element.cacheDom.bind(element);
    element.onTabClick = element.onTabClick.bind(element);
    element.selectTabByIndex = element.selectTabByIndex.bind(element);
    element.onContentSlotChange = element.onContentSlotChange.bind(element);
    element.onTabSlotChange = element.onTabSlotChange.bind(element);
  }

  render() {
    this.shadow = this.attachShadow({mode: "open"});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  cacheDom() {
    this.dom = {
      tabSlot: this.shadow.querySelector("#tab-slot"),
      contentSlot: this.shadow.querySelector("#content-slot")
    };
    this.dom.tabs = this.dom.tabSlot.assignedElements();
    this.dom.contents = this.dom.contentSlot.assignedElements();
  }

  attachEvents() {
    this.dom.tabs.forEach(tabItem => {
      tabItem.addEventListener("click", this.onTabClick, {bubbles: true});
    })

    this.dom.tabSlot.addEventListener("slotchange", this.onTabSlotChange);
    this.dom.contentSlot.addEventListener("slotchange", this.onContentSlotChange);
  }

  onTabSlotChange() {
    this.dom.tabs = this.dom.tabSlot.assignedElements();
  }

  onContentSlotChange() {
    this.dom.contents = this.dom.contentSlot.assignedElements();
  }

  onTabClick(e) {
    let tabIndex = this.dom.tabs.indexOf(e.currentTarget);
    this.setAttribute("selectedTabIndex", tabIndex);
  }

  selectTabByIndex(index) {
    const tab = this.dom.tabs[index];
    const content = this.dom.contents[index];

    if (!tab || !content) return;
    this.dom.contents.forEach(p => p.classList.remove("selected"));
    this.dom.tabs.forEach(p => p.classList.remove("selected"));
    content.classList.add("selected");
    tab.classList.add("selected");
  }

  attributeChangedCallback(name, oldValue, newValue) {

    if (name.toLowerCase() === "selectedtabindex") {
      this.selectedTabIndex = newValue;
    } else {
      this[name] = newValue;
    }

  }

  static get observedAttributes() {
    return ["selectedtabindex", "direction"];
  }

  set selectedTabIndex(value) {
    this._selectedTabIndex = value;
    this.selectTabByIndex(value);
  }

  get selectedTabIndex() {
    return this._selectedTabIndex;
  }

  set direction(value) {
    this._direction = value;
    this.setAttribute("direction", value);
  }

  get direction() {
    return this._direction;
  }
}
