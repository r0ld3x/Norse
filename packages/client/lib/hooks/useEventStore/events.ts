import {
  PageViewEvent,
  ReferralEventProps,
  SearchEvent,
  createEvent,
} from '../../../lib/utils/GTM';
import { parseCookies } from 'nookies';
import router from 'next/router';

const isDevelopment = process.env.NODE_ENV === 'development';

const getFromSessionStorage = (key: string) => {
  if (key == null) return;

  const cookies = parseCookies();
  const itemKey = `event.${cookies['session-id']}.${key}`; // event.1234.pageview
  return JSON.parse(sessionStorage.getItem(itemKey) || 'null');
};

const setSessionStorage = (key: string, value: any) => {
  if (key == null || value == null) return;

  const cookies = parseCookies();
  const itemKey = `event.${cookies['session-id']}.${key}`; // event.1234.pageview
  sessionStorage.setItem(itemKey, JSON.stringify(value || {}));
};

export const createFeedbackEvent = async (e: any) => {
  if (isDevelopment) {
    console.log({
      event: '/// FEEDBACK EVENT ///',
      data: e,
    });
  }
};

export const createLinkEvent = async (e: any) => {
  if (isDevelopment) {
    console.log({
      event: '/// LINK EVENT ///',
      data: e,
    });
  }
};

export const createPageViewEvent = async (e: any) => {
  const eventExists = getFromSessionStorage(`pageview-${e.url}`);

  if (!eventExists) {
    if (isDevelopment) {
      console.log({
        event: '/// PAGE VIEW EVENT ///',
        data: e,
      });
    }

    const newEvent = {
      event: 'pageview',
      page: e.url,
    };

    createEvent<PageViewEvent>(newEvent);
    setSessionStorage(`pageview-${e.url}`, newEvent);
  }
};

export const createReferralEvent = async (
  referralType: 'call_referral' | 'website_referral' | 'directions_referral',
  resourceId: string,
  resource: any
) => {
  const eventExists = getFromSessionStorage(`referral.${resourceId}`);
  if (!eventExists) {
    if (isDevelopment) {
      console.log({
        event: '/// REFERRAL EVENT ///',
        data: { referralType, resourceId, resource },
      });
    }

    const newEvent = {
      event: 'referral',
      ...resource,
      ...router.query,
    };

    createEvent<ReferralEventProps>(newEvent);
    setSessionStorage(`referral.${resourceId}`, newEvent);
  }

  const eventExists2 = getFromSessionStorage(`${referralType}.${resourceId}`);
  if (!eventExists2) {
    if (isDevelopment) {
      console.log({
        event: '/// REFERRAL EVENT ///',
        data: { referralType, resourceId, resource },
      });
    }

    const newEvent = {
      event: referralType,
      ...resource,
      ...router.query,
    };

    createEvent<ReferralEventProps>(newEvent);
    setSessionStorage(`${referralType}.${resourceId}`, newEvent);
  }
};

export const createResultsEvent = async (e: any) => {
  if (router.query.query_type === 'taxonomy') {
    const eventExists = getFromSessionStorage(`search.${router.query.query}`);

    if (!eventExists) {
      if (isDevelopment) {
        console.log({
          event: '/// RESULTS EVENT ///',
          data: e,
        });
      }

      const newEvent = {
        event: 'search',
        ...router.query,
        results: e.total,
      };

      createEvent<SearchEvent>(newEvent);
      setSessionStorage(`search.${router.query.query}`, newEvent);

      const taxonomies = (router?.query?.query as string)?.split(',') ?? [];
      for (const taxonomy of taxonomies) {
        const eventExists = getFromSessionStorage(`taxonomy.${taxonomy}`);

        if (!eventExists) {
          const newEvent = {
            event: 'taxonomy',
            taxonomy: taxonomy,
            ...router.query,
            results: e.total,
          };

          createEvent<SearchEvent>(newEvent);
          setSessionStorage(`taxonomy.${taxonomy}`, newEvent);
        }
      }
    }
  } else {
    const eventExists = getFromSessionStorage(`search.${router.query.query}`);

    if (!eventExists) {
      if (isDevelopment) {
        console.log({
          event: '/// RESULTS EVENT ///',
          data: e,
        });
      }

      const newEvent = {
        event: 'search',
        ...router.query,
        results: e.total,
        query_label: router?.query?.query ?? null,
      };

      createEvent<SearchEvent>(newEvent);
      setSessionStorage(`search.${router.query.query}`, newEvent);
    }
  }
};

export const createTourEvent = async (data: any) => {
  if (isDevelopment) {
    console.log({
      event: '/// TOUR EVENT ///',
      data: data,
    });
  }
};
