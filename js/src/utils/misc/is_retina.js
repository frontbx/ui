/**
 * Is this a mobile user agent?
 *
 * @return {bool}
 */
_.prototype.is_retina = function()
{
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
                      (min--moz-device-pixel-ratio: 1.5),\
                      (-o-min-device-pixel-ratio: 3/2),\
                      (min-resolution: 1.5dppx)";

    if (window.devicePixelRatio > 1)
    {
        return true;
    }

    if (window.matchMedia && window.matchMedia(mediaQuery).matches)
    {
        return true;
    }

    return false;
}
