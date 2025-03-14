# Inline Elements

Frontbx comes with a number of common  inline utility elements pre-styled to help save you time coding.

---

*	[Icon](#icon)
*	[Link](#link)
*	[Badge](#badge)
*	[Status](#status)
*	[Label](#label)
*	[Loading](#loading)
*	[Avatar](#avatar)
*	[Caret](#caret)

---

### Icon

Frontbx comes with a complete icon library thanks to [IcoMoon](https://icomoon.io/). The library is free and comes with 675 individual icons.

To create an icon, use a `<span>` element with the class `.glyph-icon` in addition to `.fa-[name]` with the icon name as per IcoMoon documentation.

Icons can be sized using the `.icon-xs`, `.icon-md`, `.icon-lg`, `.icon-xl`, `.icon-xxl` modifier classes which are setup in `scss/_config.scss`.

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-xs">
        <span class="fa fa-headphones icon-xs"></span>
        <span class="fa fa-headphones icon-md"></span>
        <span class="fa fa-headphones icon-lg"></span>
        <span class="fa fa-headphones icon-xl"></span>
        <span class="fa fa-headphones icon-xxl"></span>
    </div>
</div>

```html
<span class="fa fa-headphones icon-xs"></span>
<span class="fa fa-headphones icon-md"></span>
<span class="fa fa-headphones icon-lg"></span>
<span class="fa fa-headphones icon-xl"></span>
<span class="fa fa-headphones icon-xxl"></span>
```

---

### Link

The `.fancy-link` class creates a simple hover effect on any link.

<div class="fbx-snippet-demo">
   <div class="row text-center">
       	<a href="#" title="fancy" class="fancy-link">Fancy Link</a>&nbsp;&nbsp;
       	<a href="#" title="fancy" class="fancy-link">Fancy Link</a>  
    </div>
</div>

```html
<a href="#" title="fancy" class="fancy-link">Fancy Link</a>
```

---

### Badge

`.badge` can be used to display a digit of new or unread items to the user. For example how many unread notifications the user has.

Badges can be customized using Frontbx's contextual classes: 

`.badge-primary`, `.badge-secondary`, `.badge-info`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-white`, `.badge-black`

`.badge` can be displayed in `.btn` by adding the `.with-badge` to class button.

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-xs pole-sm pole-s">
    	<div class="avatar">
            <img data-src="../../assets/img/trump-avatar.jpg" class="img-responsive js-lazyload lazyload grayscale" src="../../assets/img/trump-avatar_thumb.jpg" />
        	<span class="badge badge-danger">9</span>
        </div>
        <div class="avatar">
            <img data-src="../../assets/img/trump-avatar.jpg" class="img-responsive js-lazyload lazyload grayscale" src="../../assets/img/trump-avatar_thumb.jpg" />
        	<span class="badge badge-info">4</span>
        </div>
   	</div>
   	<div class="flex-row-fluid align-cols-center text-center col-gaps-xs">
        <button class="btn with-badge">
            Notifications
            <span class="badge badge-info">3</span>
        </button>
        <button class="btn btn-outline with-badge">
            Notifications
            <span class="badge badge-danger">3</span>
        </button>
        <button class="btn btn-pure with-badge">Hello World
            <span class="badge badge-info">3</span>
        </button>
    </div>
</div>

```html
<div class="avatar">
    <img ... />
	<span class="badge badge-danger">9</span>
</div>
<button class="btn with-badge">
    Notifications
    <span class="badge badge-info">3</span>
</button>
```

You can customize the size or color of any badge using local CSS variables on `.badge`:

```scss
.my-badge
{
	--fbx-badge-size: 12px;
	--fbx-badge-color: var(--fbx-white);
	--fbx-badge-bg: var(--fbx-color-teal);
}
```

---

### Status

Use the `.status` class to indicate a status:

`.status` can be customized using Frontbx's contextual classes: 

`.status-primary`, `.status-secondary`, `.status-info`, `.status-success`, `.status-warning`, `.status-danger`, `.status-white`, `.status-black`

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-xs">
    	<div class="avatar">
            <img data-src="../../assets/img/trump-avatar.jpg" class="img-responsive js-lazyload lazyload grayscale" src="../../assets/img/trump-avatar_thumb.jpg" />
        	<span class="status status-warning"></span>
        </div>
        <div class="avatar">
            <img data-src="../../assets/img/trump-avatar.jpg" class="img-responsive js-lazyload lazyload grayscale" src="../../assets/img/trump-avatar_thumb.jpg" />
        	<span class="status status-success"></span>
        </div>
        <div class="avatar">
            <img data-src="../../assets/img/trump-avatar.jpg" class="img-responsive js-lazyload lazyload grayscale" src="../../assets/img/trump-avatar_thumb.jpg" />
        	<span class="status status-danger"></span>
        </div>
    </div>
</div>

```html
<div class="avatar">
    <img ... />
	<span class="status status-warning"></span>
</div>
```

You can customize the size or color of any status using local CSS variables on `.status`:

```scss
.my-status
{
	--fbx-status-size: 12px;
	--fbx-badge-color: var(--fbx-color-teal);
}
```

---

### Label

`.label` can be used to emphasize content with text. There are two variants available - the standard label and `.label-outline`.

`.label` can be customized using Frontbx's contextual classes: 

`.label-primary`, `.label-secondary`, `.label-info`, `.label-success`, `.label-warning`, `.label-danger`, `.label-white`, `.label-black`

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-xs pole-sm pole-s">
        <span class="label">NEW</span>
        <span class="label label-primary">NEW</span>
        <span class="label label-info">NEW</span>
        <span class="label label-success">NEW</span>
        <span class="label label-warning">NEW</span>
        <span class="label label-danger">NEW</span>
    </div>
    <div class="flex-row-fluid align-cols-center text-center col-gaps-xs">
        <span class="label label-outline">NEW</span>
        <span class="label label-primary label-outline">NEW</span>
        <span class="label label-info label-outline">NEW</span>
        <span class="label label-success label-outline">NEW</span>
        <span class="label label-warning label-outline">NEW</span>
        <span class="label label-danger label-outline">NEW</span>
    </div>
</div>

```html
<span class="label label-primary">NEW</span>
<span class="label label-outline label-danger">NEW</span>
```

---

### Loading

Frontbx comes with 5 basic loading animators. Use the base class `.loader` with `.loader-[num]`. Additionally loaders can be styled with Frontbx's context classes:

`.loader-primary`, `.loader-secondary`, `.loader-info`, `.loader-success`, `.loader-warning`, `.loader-danger`, `.loader-white`, `.loader-black`

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-sm">
        <span class="loader loader-1"></span>
        <span class="loader loader-2"></span>
        <span class="loader loader-3"></span>
        <span class="loader loader-4"></span>
        <span class="loader loader-5"></span>
    </div>
</div>

```html
    <span class="loader loader-1"></span>
    <span class="loader loader-2"></span>
    <span class="loader loader-3"></span>
    <span class="loader loader-4"></span>
    <span class="loader loader-5"></span>
```

<div class="fbx-snippet-demo">
	<div class="flex-row-fluid align-cols-center text-center col-gaps-sm">
		<span class="loader loader-1 loader-primary"></span>
		<span class="loader loader-2 loader-info"></span>
		<span class="loader loader-3 loader-success"></span>
		<span class="loader loader-4 loader-warning"></span>
		<span class="loader loader-5 loader-danger"></span>
	</div>
</div>

```html
    <span class="loader loader-1 loader-primary"></span>
    <span class="loader loader-2 loader-info"></span>
    <span class="loader loader-3 loader-success"></span>
    <span class="loader loader-4 loader-warning"></span>
    <span class="loader loader-5 loader-danger"></span>
```

---

### Avatar

`.avatar` can be used to to create a simple circular image avatar, an icon or initials.

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-sm">
        <div class="avatar">
            <img data-src="../../assets/img/trump-avatar.jpg" class="img-responsive js-lazyload lazyload grayscale" src="../../assets/img/trump-avatar_thumb.jpg" />
        </div>
        <div class="avatar">
            <span class="fa fa-user color-danger"></span>
        </div>
        <div class="avatar">
            <span class="initials">DT</span>
        </div>
    </div>
</div>

```html
<div class="avatar">
    <img ... />
</div>
<div class="avatar">
    <span class="fa fa-user color-danger"></span>
</div>
<div class="avatar">
    <span class="initials">DT</span>
</div>
```

Adjust sizing and backgrounds using the available sizing modifiers `.avatar-xs` `.avatar-sm` `.avatar-md` `.avatar-lg` `.avatar-xl` and contextual classes `.avatar-primary`, `.avatar-secondary`, `.avatar-info`, `.avatar-success`, `.avatar-warning`, `.avatar-danger`, `.avatar-white`, `.avatar-black`.

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-sm">
        <div class="avatar avatar-xs">
            <img data-src="../../assets/img/trump-avatar.jpg" class="img-responsive js-lazyload lazyload grayscale" src="../../assets/img/trump-avatar_thumb.jpg" />
        </div>
        <div class="avatar avatar-sm">
            <span class="fa fa-user color-danger"></span>
        </div>
        <div class="avatar avatar-md">
            <span class="fa fa-user color-danger"></span>
        </div>
        <div class="avatar avatar-lg">
            <span class="initials">DT</span>
        </div>
        <div class="avatar avatar-xl avatar-primary">
            <span class="initials">DT</span>
        </div>
    </div>
</div>

```html
<div class="avatar avatar-xs">
    <img ... />
</div>

<div class="avatar avatar-sm">
    <span class="fa fa-user color-danger"></span>
</div>

<div class="avatar avatar-md">
    <span class="fa fa-user color-danger"></span>
</div>

<div class="avatar avatar-lg">
    <span class="initials">DT</span>
</div>

<div class="avatar avatar-xl avatar-primary">
    <span class="initials">DT</span>
</div>
```

---

### Caret

`.caret` can be used to show the user that a button or other content will either dropdown or dropup. You can use them wherever you like but here's an example in a button.

<div class="fbx-snippet-demo">
    <div class="flex-row-fluid align-cols-center text-center col-gaps-sm">
        <button class="btn"> Button
            <span class="caret-s"></span>
        </button>
        <button class="btn btn-outline"> Button
            <span class="caret-n"></span>
        </button>
        <button class="btn btn-info"> Button
            <span class="caret-n"></span>
        </button>
        <button class="btn btn-info btn-outline"> Button
            <span class="caret-n"></span>
        </button>
    </div>
</div>

```html
<button class="btn"> Button
    <span class="caret-s">
</button>
<button class="btn"> Button
    <span class="caret-n">
</button>
```



