(function()
{
    /**
     * Helpers.
     *
     * @var  {Function}
     */
    const [array_filter, dom_element, is_empty, each, is_array, is_object, is_bool, is_constructed, is_constructable, is_function, is_htmlElement, is_null, is_number, is_string, is_undefined, map, str_replace] = frontbx.import(['array_filter','dom_element','is_empty','each','is_array','is_object','is_bool','is_constructed','is_constructable','is_function','is_htmlElement','is_null','is_number','is_string','is_undefined','map','str_replace']).from('_');

    /**
     * JSX create element.
     *  
     * @param   {string | function}   tag         Root html element
     * @param   {object | undefined}  attrs       Tag props / attributes
     * @param   {array | undefined}  ...children  Tag children (recursive)
     * @returns {Array|HTMLElement}
     */
    createElement = function(tag, attributes)
    {
        // Empty
        if (arguments.length === 0) return document.createTextNode('');

        // Get children
        let children = arguments.length > 2 ? array_filter([].slice.call(arguments, 2)) : [];

        // Special case for text
        if (tag === 'text') return document.createTextNode(children.toString());

        // Special case for comments
        if (tag === 'comment') return document.createComment(children.toString());

        // Normalise children
        children = _normaliseChildren(children.length === 0 && attributes.children && !is_empty(attributes.children) ? attributes.children : children);

        let node = is_function(tag) || is_constructed(tag) ? _createComponent(tag, {...attributes, children}) : dom_element({...attributes, children, tag});

        //if (is_array(node) || Object.prototype.toString.call(node).toLowerCase() === '[object text]') return node;

        //each(children, (i, child) => node.appendChild(child));

        return node;
    }

    /**
     * Create component.
     *
     * @access {private}
     * @param  {HTMLElement} vnode
     * @param  {HTMLElement} parentDOMElement
     * @return {Array}
     */
    function _createComponent(component, attributes)
    {        
        let { render, props } = _comoponentRenderFn(component, attributes);

        BINDINGS_CACHE.props = props;

        let rendered = render(props);

        if (is_htmlElement(rendered))
        {
            //if (children.nodeType === 1) frontbx.dom().refresh(children);

            return rendered;
        }
        else if (is_array(rendered))
        {
            //if (children.nodeType === 1) frontbx.dom().refresh(children);

            return _normaliseChildren(rendered);
        }

        let toJsx = jsx(rendered);

        //if (children.nodeType === 1) frontbx.dom().refresh(children);

        return toJsx;
    }

    /**
     * Get component render function.
     *
     * @access {private}
     * @param  {String}   name
     * @return {Function}
     */
    function _comoponentRenderFn(fn, props)
    {
        if (is_constructed(fn))
        {           
            if (!fn.render) throw new Error('Object Components must implement the [render] method');

            CURR_RENDER.current = fn;

            if (fn.defaultProps) props = {...fn.defaultProps, ...props };

            return { render: fn.render, props };
        }

        if (is_constructable(fn))
        {
            let component = new fn;

            if (!component.render) throw new Error('Object Components must implement the [render] method');

            CURR_RENDER.current = component;

            if (component.defaultProps) props = {...component.defaultProps, ...props };

            return { render: component.render, props };
        }

        if (!is_function(fn)) throw new Error(`Invalid Component [${name}]`);

        CURR_RENDER.current = fn;

        if (fn.defaultProps) props = {...fn.defaultProps, ...props };

        return { render: fn, props };
    }

    /**
     * Caches and returns a children function.
     *
     * @access {private}
     * @param  {String} key   Cached callback key
     * @param  {Mixed}  value Children value
     * @return {Array|HTMLElement|String}
     */
    function _normaliseChildren(value)
    {
        // Flatten arrays
        if (is_array(value)) return map(array_filter(_flatten(value)), (i, sub) => _normaliseChild(sub));

        return _flatten([_normaliseChild(value)]);
    }

    function _normaliseChild(child)
    {
        // Already parsed
        if (is_htmlElement(child)) return child;

        // Functions
        if (is_function(child)) return jsx(child());

        // Empty strings
        if (is_string(child) && str_replace(child, ['undefined','null','false','NaN'], '').trim() === '') return document.createTextNode('');

        // Empty values
        if (is_null(child) || is_undefined(child) || child === false) return document.createTextNode('');

        // Objects
        if (is_object(child)) throw new Error('Objects cannot be used as children');

        return jsx(`${child}`);
    }

    /**
     * Flatten multidimensional children.
     *
     * @access {private}
     * @param  {HTMLElement|Array} DOMElement
     * @return {HTMLElement|Array}
     */
    function _flatten(children)
    {
        if (is_array(children))
        {
            let ret = [];

            each(children, (i, child) => is_array(child) ? ret = [...ret, ..._flatten(child)] : ret.push(child));

            return ret;
        }

        return children;
    }
    
})();
