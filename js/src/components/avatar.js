(function()
{
    /**
     * Component base
     * 
     * @var {class}
     */
    const Component = frontbx.Component(frontbx.IMPORT_AS_REF);

    /**
     * Toggle active on tables
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    const Avatar = function()
    { 
        this.super();
    }

    /**
     * Default props.
     *
     * @author    {Joe J. Howard}
     * @copyright {Joe J. Howard}
     * @license   {https://raw.githubusercontent.comfrontbx/uimaster/LICENSE}
     */
    Avatar.prototype.defaultProps =
    {
        size: null,
        context: null,
        initials: null
    };

    /**
     * @inheritdoc
     * 
     */
    Avatar.prototype.render = function(props)
    {
        return `<div class="avatar { props.size ? 'avatar-' + props.size : '' } {props.context ? 'avatar-' + props.context : '' }">
        {
            props.initials ? <span class="initials">{props.initials}</span> : props.children,
        }
        </div>`;
    }

    // Load into frontbx DOM core
    frontbx..register('Avatar', extend(Component, Avatar));

})();