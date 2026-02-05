(()=>{

    const GTM_ID = ''
    
    if (ms_uhf_data.settings == '') {
        return
    }

    const settings = JSON.parse(ms_uhf_data.settings);
    // console.log("__Cookies_settings__", settings);

    const EXP_DATE   = `Thu, 01 Jan 1970 00:00:01 GMT`

    // const MS_DOMAINS = [
    //     { domain: '.wpengine.com' , path: '/' }, 
    //     { domain: '.microsoft.com', path: '/' }
    // ];
    
 

    // console.log('Wait for user consent...', window.WcpConsent, window.siteConsent)
    
    const appendScript = (id, scriptContent) => {
        const cleanedID = id.replace(/\s/g,'-').toLowerCase() + '-script'
        if (document.getElementById(cleanedID)) return
        // console.log('appendScript', id, cleanedID, scriptContent)
        const $script = document.createElement('script');
        $script.setAttribute('type', 'text/javascript');
        $script.setAttribute('id', cleanedID);
        $script.innerHTML = scriptContent
        document.body.appendChild( $script )
    }

    const removeCookie = (name, domains) => {
        // console.log('removeCookie ?', name, domains)
        document.cookie.split(';').forEach( cookieStr => {
            const cookieName  = cookieStr.split('=')[0].trim();
            if ( cookieName === name) {
                domains.forEach(domain => {
                    // console.log('removeCookie: ',`${cookieName}=;expires=${EXP_DATE};path=/;domain=${domain};`)
                    document.cookie = `${cookieName}=;expires=${EXP_DATE};path=/;domain=${domain};`
                })
            }
        })
    }

    const checkServices = (savedCategories) => {
        settings.services.forEach( service => {
            const name    = service.name;
            const cookies = service.cookies.split('\n');
            const domains = service.domains.split('\n');
            const code    = service.code;
            const categories = service.categories;
            if (!savedCategories) {
                // console.log('NO CONSENT SCRIPT, REMOVING ANY FOUDN SERVICES', {name, cookies, domains, categories, code})
                cookies.forEach( c => removeCookie(c, domains) );
            }
            else {
                // console.log('CHECK SERVICE', savedCategories, name, cookies, domains, categories, code)
                let hasMisMatch = false
                for (let k in categories) {
                    if ( categories[k] && !savedCategories[k] ) {
                        // console.log(' -> [ERROR] cat: ', k, categories[k], ' != ', savedCategories[k] )
                        hasMisMatch = true;
                        cookies.forEach( c => removeCookie(c, domains) );
                    }
                    else {
                        // console.log(' ->  OK cat.', k+':'+categories[k], ' | savedCategories.'+k+':', savedCategories[k] )
                    }
                }
                if (!hasMisMatch && service.code) {
                    appendScript(service.name, service.code);
                }
            }

        })
    }

    /* Setup cookies when UHF callback is available */
    const checkUserConsent = () => {
        if ( !window.siteConsent ) {
            console.warn('Error: missing window.siteConsent')
            return
        }
        const savedCategories = siteConsent.getConsent();
        checkServices( savedCategories )
    }
    

    if (!window.WcpConsent) {
        // console.log('Missing window.WcpConsent, continue without saved services', window.WcpConsent );
        checkServices( null );
    }
    else {
        WcpConsent.onInitCallback(checkUserConsent);
        WcpConsent.onConsentChanged(checkUserConsent);
    }

})()