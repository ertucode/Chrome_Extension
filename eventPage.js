
const allSites = ["<all_urls>","https://*/*"]
const handledSites = ["www.youtube.com"]
//const noDaft = handledSites.slice(1,handledSites.length)
const noDaft = handledSites.filter( n => n != "something")

// Copy link title
createContext("CopyToClipboard","Copy Link Title",["link","video"],allSites)

// Search link //
createContext("SearchInGoogleL","Search In Google",["link"],allSites)
    createChild("SearchInGoogleL__","...","SearchInGoogleL")
    createChild("SearchInGoogleL_g","Görseller","SearchInGoogleL")
    createChild("SearchInGoogleL_v","Video","SearchInGoogleL")
    createChild("SearchInGoogleL_r","Reddit","SearchInGoogleL")

createContext("SearchInYoutubeL","Search in Youtube",["link"],allSites)
createContext("SearchInRedditL","Search in Reddit",["link"],allSites)

// Search selection //
createContext("SearchInGoogleS","Search In Google",["selection"],allSites)
    createChild("SearchInGoogleS__","...","SearchInGoogleS")
    createChild("SearchInGoogleS_g","Görseller","SearchInGoogleS")
    createChild("SearchInGoogleS_v","Video","SearchInGoogleS")
    createChild("SearchInGoogleS_r","Reddit","SearchInGoogleS")

createContext("SearchInYoutubeS","Search in Youtube",["selection"],allSites)
createContext("SearchInRedditS","Search in Reddit",["selection"],allSites)

// Search with copied 
createContext("SearchWithCopied","Search with Copied",["all"],allSites)

    createChild("SearchInGoogleC","Google","SearchWithCopied")
        createChild("SearchInGoogleC__","...","SearchInGoogleC")
        createChild("SearchInGoogleC_g","Görseller","SearchInGoogleC")
        createChild("SearchInGoogleC_v","Video","SearchInGoogleC")
        createChild("SearchInGoogleC_r","Reddit","SearchInGoogleC")

    createChild("SearchInYoutubeC","Youtube","SearchWithCopied")
    createChild("SearchInRedditC","Reddit","SearchWithCopied")




// // https://developer.chrome.com/docs/extensions/reference/contextMenus/
// // "contexts":["all","page","frame","selection","link","editable","image","video","audio","launcher","browser_action","page_action","action"]


chrome.contextMenus.onClicked.addListener(handleClick)

function handleClick(link,tab){
    // Search Selection
    if (typeof link.selectionText !== 'undefined'){
        lastchar = link.menuItemId.charAt(link.menuItemId.length - 1)
        if (link.menuItemId.slice(0,16) === "SearchInGoogleS_"){
            openWindows("google",link.selectionText,lastchar)
        } else if (link.menuItemId.slice(0,16) === "SearchInYoutubeS"){
            openWindows("youtube",link.selectionText,lastchar)
        } else if (link.menuItemId.slice(0,15) === "SearchInRedditS"){
            openWindows("reddit",link.selectionText,lastchar)
        }   
        else {
            chrome.tabs.sendMessage(tab.id, link.menuItemId, {frameId: link.frameId})
        } 
    }
    // Link or Copied or CopyToClipboard
    else {
        chrome.tabs.sendMessage(tab.id, link.menuItemId, {frameId: link.frameId})
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request == "openOptions"){
        var optionsUrl = chrome.extension.getURL("/options.html");
        window.open(optionsUrl)
        console.log(chrome.contextMenus)
    }
})

function copyToClipboard(text){
    var inputElement = document.createElement("input");
    inputElement.setAttribute("value",text);
    document.body.appendChild(inputElement);
    inputElement.select();
    document.execCommand("copy");
    inputElement.parentNode.removeChild(inputElement);
}

function createChild(id,title,parentId){
    chrome.contextMenus.create({
        "id": id,
        "title": title,
        "parentId": parentId,
        "contexts":["all"]
    })
}

function createContext(id,title,contexts,patterns){
    chrome.contextMenus.create({
        "id": id,
        "title": title,
        "contexts" : contexts,
        "documentUrlPatterns": patterns
    })
}

function openWindows(site,text,additional){
    texts = []
    switch (additional){
        case "r":
            texts.push(text.concat("%20site:reddit.com"))
            break;
        default:
            texts.push(text)
    }
    if (site=="youtube"){
        texts.forEach(text => window.open(`https://www.youtube.com/results?search_query=${text}`, '_blank'))
    }
    else if (site=="google"){
        if (additional === "v"){
            texts.forEach(text => window.open(`https://www.google.com/search?q=${text}&tbm=vid`, '_blank'))
        }   else if (additional === "g"){
            texts.forEach(text => window.open(`https://www.google.com/search?q=${text}&tbm=isch`, '_blank'))
        }   else {
            texts.forEach(text => window.open(`https://www.google.com/search?q=${text}`, '_blank'))
        }
    }
    else if (site=="reddit"){
        window.open(`https://www.reddit.com/search/?q=${text}`, '_blank')
    }
}

