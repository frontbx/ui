/**
 * Select single node by selector
 *
 * @access {public}
 * @param  {string} selector CSS selector
 * @param  {DOMElement}   context (optional) (default document)
 * @return {DOMElement}
 */
_.prototype.find = function(selector, context, includeContextEl)
{
    selector = selector.trim();

    context = (typeof context === 'undefined' ? document : context);

    includeContextEl = (typeof includeContextEl === 'undefined' ? false : includeContextEl && context !== document);

    let fchild = selector.substring(0, 1) === '>';
    let multi  = selector.includes(',');

    // Fast
    if (!fchild && !multi) return selector[0] === '#' ? context.getElementById(selector.substring(1)) : context.querySelector(selector);

    if (multi) selector = selector.replaceAll(/,\s?>/g, ', :scope >');
    
    if (fchild) selector = `:scope ${selector}`;

    // Fixes IDs that start with a number - rare
    if (/\#\d/.test(selector)) selector = selector.replaceAll(/(\#\d[^ ,]+)/g, '[id="$1"]').replaceAll('[id="#', '[id="');

    return context.querySelector(selector);
}


/**
 * Select and return all nodes by selector
 *
 * @access {public}
 * @param  {string} selector CSS selector
 * @param  {DOMElement}   context (optional) (default document)
 * @return {DOMElement}
 */
_.prototype.find_all = function(selector, context, includeContextEl)
{
    selector = selector.trim();

    context = (typeof context === 'undefined' ? document : context);

    includeContextEl = (typeof includeContextEl === 'undefined' ? false : includeContextEl && context !== document);

    let fchild       = selector.substring(0, 1) === '>';
    let multi        = selector.includes(',');
    let hasParent    = context.parentNode; 
    let deleteParent = false;

    if (includeContextEl)
    {
        if (!hasParent)
        {
            parent = document.createElement('div');
            parent.appendChild(context);
            deleteParent = true;
        }

        context = context.parentNode;
    }

    if (multi)  selector = selector.replaceAll(/,\s?>/g, ', :scope >');
    if (fchild) selector = `:scope ${selector}`;

    // Fixes IDs that start with a number - rare
    if (/\#\d/.test(selector)) selector = selector.replaceAll(/(\#\d[^ ,]+)/g, '[id="$1"]').replaceAll('[id="#', '[id="');

    let ret = TO_ARR.call(context.querySelectorAll(selector));

    if (deleteParent) context.parentNode.removeChild(context);

    return ret;
}