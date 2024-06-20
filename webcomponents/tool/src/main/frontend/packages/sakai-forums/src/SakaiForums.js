import { css, html, nothing } from "lit";
import "@sakai-ui/sakai-icon";
import { SakaiPageableElement } from "@sakai-ui/sakai-pageable-element";

export class SakaiForums extends SakaiPageableElement {

  static properties = {

    _showOptions: { state: true },
    _i18n: { state: true },
  };

  constructor() {

    super();

    this.showPager = true;
    this.loadTranslations("forums").then(r => this._i18n = r);
  }

  async loadAllData() {

    this.messagesClass = "three-col";

    const url = this.siteId ? `/api/sites/${this.siteId}/forums/summary` : `/api/users/${this.userId}/forums/summary`;
    return fetch(url)
      .then(r => {

        if (r.ok) {
          return r.json();
        }
        throw new Error(`Failed to get forums data from ${url}`);

      })
      .then(data => this.data = data)
      .catch (error => console.error(error));
  }

  toggleSite(e) {

    const forum = this.data.find(f => f.siteId === e.target.dataset.siteId);
    forum.hidden = e.target.checked;
    this.requestUpdate();
  }

  sortByMessages() {

    if (this.sortMessages === "01") {
      this.data.sort((a1, a2) => a2.messageCount - a1.messageCount);
      this.sortMessages = "10";
    } else {
      this.data.sort((a1, a2) => a1.messageCount - a2.messageCount);
      this.sortMessages = "01";
    }
    this.repage();
  }

  sortByForums() {

    if (this.sortForums === "01") {
      this.data.sort((a1, a2) => a2.forumCount - a1.forumCount);
      this.sortForums = "10";
    } else {
      this.data.sort((a1, a2) => a1.forumCount - a2.forumCount);
      this.sortForums = "01";
    }
    this.repage();
  }

  sortBySite() {

    if (this.sortSite === "AZ") {
      this.data.sort((a1, a2) => a1.siteTitle.localeCompare(a2.siteTitle));
      this.sortSite = "ZA";
    } else {
      this.data.sort((a1, a2) => a2.siteTitle.localeCompare(a1.siteTitle));
      this.sortSite = "AZ";
    }
    this.repage();
  }

  set _showOptions(value) {

    const old = this.__showOptions;
    this.__showOptions = value;
    if (this.__showOptions) {
      this.messagesClass = "four-col";
    } else {
      this.messagesClass = "three-col";
    }
    this.requestUpdate("_showOptions", old);
  }

  get _showOptions() { return this.__showOptions; }

  shouldUpdate(changedProperties) {
    return this._i18n && super.shouldUpdate(changedProperties);
  }

  content() {

    return html`
      <div id="options">
        <input type="checkbox" id="options-checkbox" @click=${e => this._showOptions = e.target.checked}>
        <label for="options-checkbox">${this._i18n.syn_options}</label>
      </div>
      <div class="messages ${this.messagesClass}">
        ${this._showOptions ? html`<div class="header">${this._i18n.syn_hide}</div>` : ""}
        <div class="header">
          <a href="javascript:;"
              @click=${this.sortByMessages}
              title="${this._i18n.sort_by_messages_tooltip}"
              aria-label="${this._i18n.sort_by_messages_tooltip}">
            ${this._i18n.syn_private_heading}
          </a>
        </div>
        <div class="header">
          <a href="javascript:;"
              @click=${this.sortByForums}
              title="${this._i18n.sort_by_forums_tooltip}"
              aria-label="${this._i18n.sort_by_forums_tooltip}">
            ${this._i18n.syn_discussion_heading}
          </a>
        </div>
        <div class="header">
          <a href="javascript:;"
              @click=${this.sortBySite}
              title="${this._i18n.sort_by_site_tooltip}"
              aria-label="${this._i18n.sort_by_site_tooltip}">
            ${this._i18n.syn_site_heading}
          </a>
        </div>
      ${this.dataPage.map((m, i) => html`
        ${!m.hidden || this._showOptions ? html`
        ${this._showOptions ? html`
          <div class="cell options ${i % 2 === 0 ? "even" : "odd"}">
            <input type="checkbox"
                @click=${this.toggleSite}
                data-site-id="${m.siteId}"
                ?checked=${m.hidden}
                title="${this._i18n.syn_hide_tooltip}"
                arial-label="${this._i18n.syn_hide_tooltip}">
          </div>`
        : nothing}
        <div class="cell ${i % 2 === 0 ? "even" : "odd"}"><a href="${m.messageUrl}">${m.messageCount}</a></div>
        <div class="cell ${i % 2 === 0 ? "even" : "odd"}"><a href="${m.forumUrl}">${m.forumCount}</a></div>
        <div class="cell ${i % 2 === 0 ? "even" : "odd"}"><a href="${m.siteUrl}">${m.siteTitle}</a></div>
        ` : nothing}
      `)}
      </div>
    `;
  }

  static styles = [
    SakaiPageableElement.styles,
    css`
      a {
        color: var(--link-color);
      }
      a:hover { 
        color: var(--link-hover-color);
      }
      a:active {
        color: var(--link-active-color);
      }
      a:visited {
        color: var(--link-visited-color);
      }
      #options {
        margin-bottom: 8px;
        margin-top: 10px;
      }

      .messages {
        display: grid;
        grid-auto-rows: minmax(10px, auto);
      }
        .four-col {
          grid-template-columns: 1fr 1fr 1fr 1fr;
        }
        .three-col {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .two-col {
          grid-template-columns: 1fr 1fr;
        }
        #options label {
          margin-left: 5px;
          font-size: 14px;
        }
        .messages > div:nth-child(-n+3) {
          padding-bottom: 14px;
        }
        .header {
          font-weight: bold;
          padding: 0 5px 0 5px;
        }
          .header a {
            text-decoration: none;
            color: var(--sakai-text-color-1, #000);
          }
        .cell {
          padding: 8px;
          font-size: var(--sakai-grades-title-font-size);
        }
        .even {
          background-color: var(--sakai-table-even-color);
        }
    `,
  ];
}
