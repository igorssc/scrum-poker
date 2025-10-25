export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue;
  }
  
  return null;
};

export const setCookie = (name: string, value: string, days = 100) => {
  let expires = '';

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toISOString()}`;
  }

  document.cookie = `${name}=${value}${expires}; path=/`;
};

export const eraseCookie = (name: string) => {
  setCookie(name, '', -1);
};
