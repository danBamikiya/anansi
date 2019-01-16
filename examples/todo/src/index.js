import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import { ScrollContext } from 'react-router-scroll-4';
import loadPolyfills from '@anansi/polyfill';

import ErrorBoundary from 'components/ErrorBoundary';
import ErrorLoggerContext from 'lib/ErrorLoggerContext';

import App from './App';

function shouldUpdateScroll(prevRouterProps, { history: { action } }) {
  return action !== 'REPLACE';
}
const history = createBrowserHistory();

async function init() {
  await loadPolyfills();
  ReactDOM.createRoot(document.body).render(
    <ErrorLoggerContext.Provider value={() => console.error('what what')}>
      <ErrorBoundary>
        <Router history={history}>
          <ScrollContext shouldUpdateScroll={shouldUpdateScroll}>
            <App />
          </ScrollContext>
        </Router>
      </ErrorBoundary>
    </ErrorLoggerContext.Provider>,
  );
}
init();
