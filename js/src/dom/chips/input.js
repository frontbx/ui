(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Helper functions
     * 
     * @var {Function}
     */
    const [find, find_all, on, closest, first_children, in_array, input_value, is_empty, off, remove_from_dom, extend] = frontbx.import(['find','find_all','on','closest','first_children','in_array','input_value','is_empty','off','remove_from_dom','extend']).from('_');

    /**
     * Chip inputs
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const ChipInputs = function()
    {
        this.super('.js-chips-input');
    }

    /**
     * Init a chips input
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     */
    ChipInputs.prototype.bind = function(_wrapper)
    {
        let _input = find('.js-chip-input', _wrapper);

        on(find_all('.js-remove-btn', _wrapper), 'click', this._removeChip);

        on(_input, 'keyup', this._onKeyUp, this);

        if (closest(_input, 'form'))
        {
            on(_input, 'keydown', this._preventSubmit, this);
        }
    }

    /**
     * Destroy chip listeners
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     */
    ChipInputs.prototype.unbind = function(_wrapper)
    {
        var _removeBtns = find_all('.btn-chip .js-remove-btn', _wrapper);
        var _input = find('.js-chip-input', _wrapper);

        off(_removeBtns, 'click', this._removeChip);

        off(_input, 'keyup', this._onKeyUp, this);

        if (closest(_input, 'form'))
        {
            off(_input, 'keydown', this._preventSubmit, this);
        }
    }

    /**
     * Prevent the form from submitting if it's part of a form
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChipInputs.prototype._preventSubmit = function(e, input)
    {
        e = e || window.event;

        var _key = e.code || e.key || e.keyCode || e.charCode;

        if (_key == 'Enter' || _key === 13)
        {
            e.preventDefault();

            return false;
        }
        // Backspace
        else if (_key == 'Delete' || _key == 'Backspace' || _key == 8 || _key == 46)
        {
            if (input.value === '')
            {
                var _wrapper = closest(input, '.js-chips-input');

                this._removeLastChip(_wrapper);
            }
        }
    }

    /**
     * Handle pressing enter to insert the chip
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChipInputs.prototype._onKeyUp = function(e, input)
    {
        e = e || window.event;

        var _key = e.code || e.key || e.keyCode || e.charCode;

        // Enter
        if (_key == 'Enter' || _key === 13)
        {
            var _wrapper = closest(input, '.js-chips-input');

            var _value = input_value(input).trim();

            if (!in_array(_value, this._getChipsValues(_wrapper)) && _value !== '')
            {
                this.addChip(_value, _wrapper);

                input.value = '';
            }
        }
    }

    /**
     * Remove last chip
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     */
    ChipInputs.prototype._removeLastChip = function(_wrapper)
    {
        var _chips = find_all('.btn-chip', _wrapper);

        if (!is_empty(_chips))
        {
            remove_from_dom(_chips.pop());
        }
    }

    /**
     * Insert new chip
     *
     * @access {public}
     * @param  {string}      _value
     * @param  {DOMElement}        _wrapper
     * @param  {string|bool} _icon
     */
    ChipInputs.prototype.addChip = function(_value, _wrapper, _icon)
    {
        let chip = frontbx.Chip({
            text       : _value.trim(),
            removeable : true,
            input      : _wrapper.dataset.inputName,
            variant    : _wrapper.dataset.chipClass,
        });

        _wrapper.insertBefore(chip, first_children(_wrapper).pop());

        on(find('.js-remove-btn', chip), 'click', this._removeChip);

        frontbx.dom().refresh('Ripple', _wrapper);
    }

    /**
     * Remove an existing chip
     *
     * @access {private}
     * @param  {event|null} e
     */
    ChipInputs.prototype._removeChip = function(e)
    {
        e = e || window.event;

        e.preventDefault();

        remove_from_dom(closest(this, '.btn-chip'));
    }

    /**
     * Get all values from chip input
     *
     * @access {private}
     * @param  {DOMElement}    _wrapper
     * @return {array}
     */
    ChipInputs.prototype._getChipsValues = function(_wrapper)
    {
        var _result = [];

        var _chips = find_all('.btn-chip input', _wrapper);

        for (var i = 0; i < _chips.length; i++)
        {
            _result.push(input_value(_chips[i]));
        }

        return _result;
    }

    // Load into frontbx DOM core
    frontbx.dom().register('ChipInputs', extend(Component, ChipInputs));

})();