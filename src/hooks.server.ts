import cookie from 'cookie';

export const getSession = ({ headers }) => {
    const cookies = cookie.parse(headers.cookie || '');
    console.log('getSession')
    return {
        userData: cookies.userData ? JSON.parse(decodeURIComponent(cookies.userData)) : null
    };
};
