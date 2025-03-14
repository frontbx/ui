/**
 * Replace or append a node's innerHTML
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement  Target element
 * @param  {string} content     Target content
 * @param  {bool}   append      Append innerHTML or replace (optional) (default false)
 */
_.prototype.inner_HTML = function(DOMElement, content, append)
{
    append = this.is_undefined(append) ? false : append;

    if (!append)
    {
        this.clear_event_listeners(DOMElement, true);

        DOMElement.innerHTML = '';
    }

    this._recursive_dom_element(content, DOMElement);

    this.trigger_event(DOMElement, `frontbx:dom:mutate`);

    this.trigger_event(window, `frontbx:dom:mutate`, { DOMElement: DOMElement });
}