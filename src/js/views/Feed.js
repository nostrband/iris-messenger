import { html } from 'htm/preact';
import iris from 'iris-lib';
import { Link } from 'preact-router/match';

import FeedMessageForm from '../components/FeedMessageForm';
import MessageFeed from '../components/MessageFeed';
import PeopleFeed from '../components/PeopleFeed';
import OnboardingNotification from '../components/OnboardingNotification';
import { translate as t } from '../translations/Translation';

import View from './View';

class Feed extends View {
  constructor() {
    super();
    this.eventListeners = {};
    this.state = { sortedMessages: [], group: 'follows', searchView: 'posts' };
    this.messages = {};
    this.id = 'message-view';
    this.class = 'public-messages-view';
  }

  search() {
    const searchTerm = this.props.term && this.props.term.toLowerCase();
    this.setState({ searchTerm });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.term !== this.props.term) {
      this.search();
    }
  }

  componentDidMount() {
    this.restoreScrollPosition();
    this.search();
    iris.local().get('filters').get('group').on(this.inject());
  }

  filter(msg) {
    if (this.state.searchTerm) {
      return msg.text && msg.text.toLowerCase().indexOf(this.state.searchTerm) > -1;
    }
    return true;
  }

  navigateToTab(tab) {
    this.setState({ searchView: tab });
  }

  renderView() {
    const s = this.state;
    let path = this.props.index || 'msgs';
    return html`
      <div class="centered-container">
        <div style="display:flex;flex-direction:row">
          <div style="flex:3;width: 100%">
            ${s.searchTerm
              ? ''
              : html`
                  <${FeedMessageForm}
                    placeholder=${t('whats_on_your_mind')}
                    key="form${path}"
                    class="hidden-xs"
                    autofocus=${false}
                  />
                `}
            ${s.searchTerm
              ? html`<h2>${t('search')}: "${s.searchTerm}"</h2>
                  <div class="tabs">
                    <${Link} onClick=${() => this.navigateToTab('posts')}>${t('posts')} <//>
                    <${Link} onClick=${() => this.navigateToTab('people')}>${t('people')} <//>
                  </div>`
              : this.props.index !== 'everyone'
              ? html` <${OnboardingNotification} /> `
              : ''}
            ${s.searchView === 'posts'
              ? html`<div>
                  <${MessageFeed}
                    scrollElement=${this.scrollElement.current}
                    filter=${s.searchTerm && ((m) => this.filter(m))}
                    keyword=${s.searchTerm}
                    thumbnails=${this.props.thumbnails}
                    key=${this.props.index || 'feed'}
                    index=${this.props.index}
                    path=${path}
                  />
                </div>`
              : html`<div>
                  <${PeopleFeed}
                    scrollElement=${this.scrollElement.current}
                    filter=${s.searchTerm && ((m) => this.filter(m))}
                    keyword=${s.searchTerm}
                    thumbnails=${this.props.thumbnails}
                    key=${this.props.index || 'feed'}
                    index=${this.props.index}
                    path=${path}
                  />
                </div>`}
          </div>
        </div>
      </div>
    `;
  }
}

export default Feed;
