/**
 * Get an element's actual height in px
 *
 * @access {public}
 * @param  {DOMElement}   DOMElement Target element
 * @return {object}
 */
_.prototype.height = function(DOMElement)
{
    if (DOMElement === window || DOMElement === document || DOMElement === document.documentElement) return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    return this.css_unit_value(this.rendered_style(DOMElement, 'height'));
}