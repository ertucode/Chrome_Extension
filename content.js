//content script
var desiredText = null;

myoptions = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "1500",
    "hideDuration": "1500",
    "timeOut": "3000",
    "extendedTimeOut": "2000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "show",
    "hideMethod": "fadeOut"
}

// desiredText'i tanımla
document.addEventListener("contextmenu", function(event){
    chars = ["(",")",".",",","/","*","'","-","_","#","$","%","&",";",":"]
    desiredText = event.target.textContent;
    if (desiredText.length == 0 && window.location.hostname == "www.exampleee.com"){
        desiredText = event.target.parentElement.parentElement.parentElement.parentElement.title;
    }
    if (desiredText.length == 0 && window.location.hostname == "example.org"){
        desiredText = event.target.parentElement.title;
    }
    desiredText = delChars(desiredText,chars)
    console.log(desiredText);

}, true);


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    lastchar = request.charAt(request.length - 1)

    // Open from link
    if (request.slice(0,16) === "SearchInGoogleL_"){
        openWindows("google",desiredText,lastchar)
    } else if (request.slice(0,16) === "SearchInYoutubeL"){
        openWindows("youtube",desiredText,lastchar)
    } else if (request.slice(0,15) === "SearchInRedditL"){
        openWindows("reddit",desiredText,lastchar)
    } 
    // Open from copied text
     else if (request.slice(0,16) === "SearchInGoogleC_"){
        openCopiedWindow("google",myoptions,lastchar)
    } else if (request.slice(0,16) === "SearchInYoutubeC"){
        openCopiedWindow("youtube",myoptions,lastchar)
    } else if (request.slice(0,15) === "SearchInRedditC"){
        openCopiedWindow("reddit",myoptions,lastchar)
    }
    // Copy link title
    else if (request === "CopyToClipboard"){
        copyToClipboard(desiredText)
    }
});

document.addEventListener('keydown', handleKeydown);

// || e.srcElement.
function handleKeydown(e){
    if (e.target.baseURI == "https://web.whatsapp.com/"){
        return}
    if (e.srcElement.nodeName !== 'INPUT') {
        if (isInt(e.key)){
            copyAndShowToast("success",delWords(desiredText,parseInt(e.key)),myoptions)
        }
        else if(e.key == "*"){
            copyAndShowToast("success",delWords(desiredText,100),myoptions)
        }  
        else if(e.key == "-"){
            //window.open(`cavit://oıjdsahfoıdsaf`, '_blank')
        }    
    }
}

function isInt(value) {
    if (isNaN(value)) {
      return false;
    }
    var x = parseFloat(value);
    return (x | 0) === x;
}

function delChars(text,chars){
    for (i=0;i<chars.length;i++){
        if (chars[i] === "-" || chars[i] === "_"){
            text = text.replaceAll(chars[i]," ");
        }   else {
            text = text.replaceAll(chars[i],"");
        }
    } 
    text = text.replace(/\s\s+/g, ' ');
    return text;
}

function delWords(text, length){
    splits = text.split(" ");
    newText = "";
    if (splits.length >= length){
        for (i=0;i<length;i++){
            newText = newText.concat(splits[i] + " ");
        } 
        newText = newText.trim();
    } else {return text}
    return newText;
}

function copyToClipboard(text){
    var inputElement = document.createElement("input");
    inputElement.setAttribute("value",text);
    document.body.appendChild(inputElement);
    inputElement.select();
    document.execCommand("copy");
    inputElement.parentNode.removeChild(inputElement);
}

function showToast(type,message,options){
    toastr[type](message)
    toastr.options = options
}

function copyAndShowToast(type,text,options){
    copyToClipboard(text)
    message = "--> " + text;
    toastr[type](message)
    toastr.options = options
}

function openCopiedWindow(site,options,additional=""){
    navigator.clipboard.readText()
    .then(text => {openWindows(site,text,additional)})
    .catch(err => {
        showToast("error","Failed to Read Clipboard",options)
    });
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