# Custom Nodes

In order to use Psiagram to the fullest, developers can use the framework to build out a custom Node library. In this section we will touch on the API of Nodes and how to extend the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) class in order to build custom components.

But first, some links to various Node files:

1. [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts)
   * Provides the base implementation of Node. Every Node must extend this class

     \(or if not, it must at least be in the prototype chain\)

   * Must be extended in order to be functional
2. [Text Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeAbstracts/TextNode.ts)
   * Provides an extended Node that handles placing text within the Node
   * Must be extended in order to be functional
3. [Rectangle](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeLibrary/Rectangle.ts)
   * This is an example implementation. Use this as a reference for any Nodes

     you build.

   * Implements [Text Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeAbstracts/TextNode.ts) \(see above\) to create a Rectangle Node in basic grey

     colors

   * Functional as is \(does not need to be extended\)

Feel free to check the links out to get a basic idea of some of the Nodes provided by Psiagram. They will be referenced later on.

The [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) takes care of a lot of the internal-use scenarios \(example: the `getElement` method is defined already, so that Paper can call it to get the Node group, which is also pre-defined\). However, some of the functionality must be implemented in order for your custom Node to work. The following are the methods and interfaces within the Node API.

## Base Node Initialization Properties

The properties of the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) defined in TypeScript are:

```typescript
export interface IBaseNodeProperties {
  id: string;
  gridSize: number;
  uniqueId: string;
  paper: Paper;
}
```

The `id`, `gridSize`, `uniqueId` and `paper` properties are given by Paper to every Node. As you can see, there isn't much here to define the look and feel of the Node. This only serves as a foundation, and provides definitions for the two properties that are passed in from the Paper instance.

See the [Text Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeAbstracts/TextNode.ts) to see how `IBaseNodeProperties` is extended to allow for more properties.

## Base Node Class Properties

The properties of the Base Class defined in TypeScript are:

```typescript
protected props: P;
private _group: SVGElement;
```

`P` represents the props given to the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) or extending class. These props **must** extend `IBaseNodeProperties` - i.e. they must include `id` and `gridSize`.

Group is kept private, and should not be touched by any classes extending the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts). However, `props` is to be used for storing any passed-in props, and is accessible from all extending classes.

Check out how [Text Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeAbstracts/TextNode.ts) extends the constructor of [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) to set defaults for certain props.

## Base Node Class Methods

There are multiple methods within the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts). Many of these should not be touched, or should only be extended if needed.

### constructor

```typescript
constructor(props: P);
```

Once again, `P` represents the props given to the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) or extending class. The constructor is where you initialize any of the props passed into the extending class. All of the [Base Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/BaseNode.ts) props are already taken care of, so you only need to worry about the new ones. For example, here is the constructor taken from [Text Node](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeAbstracts/TextNode.ts):

```typescript
constructor(props: P) {
  // Call super so that the base Node can initialize it's props and create the
  // Node group
  super(props);

  // Initialize any additional elements for the class. Later on, these will be
  // generated and then inserted into the group using the methods within Node.
  this._text = null;

  // This is where you can set the defaults for any additional props that are
  // passed into the extending class. For TextNode, these are title and
  // fontHeight.
  this.props = {
    // To avoid ts error https://github.com/Microsoft/TypeScript/issues/14409
    ...(this.props as any),
    title: props.title,
    fontHeight: props.fontHeight || 14,
  };
}
```

### initialize

```typescript
initialize(): void;
```

{% hint style="warning" %}
The initialize method **must** be overwritten.
{% endhint %}

Initialize is called when the Node is being mounted into the DOM. You can build visual SVG components and add them to the group using `this.addToGroup(element)`. This function is only called once, so any changes in the future must be done through setters. Here's [Text Node's](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeAbstracts/TextNode.ts) initialize function as an example:

```typescript
public initialize(): void {
  const { title, id, fontHeight } = this.props;

  // Create any of the elements required for this extended Node.
  this._text = createSVGWithAttributes('text', {
    id: id + '_text',
    'text-anchor': 'middle',
    'font-size': fontHeight,
  });
  this._text.textContent = title || '';

  // Add the elements to the private Node group by using the addToGroup method.
  this.addToGroup(this._text);

  // This is a function specific to TextNode to update text position on change.
  this.updateTextPosition();
}
```

### teardown

```typescript
teardown(): void;
```

Teardown is called when the Node is being removed from the DOM. You can cause transformations, change appearance, and teardown any listeners or processes. If none of these are needed, you do not need to overwrite this function.

### width

{% hint style="warning" %}
Width get and set **must** be overwritten.
{% endhint %}

#### get

```typescript
get width(): number;
```

External methods need to call `ThisNode.width` in order to calculate various things, and it's not as straightforward as getting it from props \(ex: your component is a circle that takes only radius, so get width must return 2 \* radius\).

For example, here is the width getter in [Rectangle](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeLibrary/Rectangle.ts):

```typescript
get width(): number {
  return this.props.width;
}
```

#### set

```typescript
set width(width: number);
```

You may also wish to adjust the width of this component, and in doing so, you want those changes to be reflected in the DOM automatically. All of the manipulations must be wrapped in setters so updating the DOM is as easy as `ThisNode.width = 200`;

For example, here is the width setter in [Rectangle](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeLibrary/Rectangle.ts):

```typescript
set width(width: number) {
  // Check if shape exists (shape is the actual visual part of the Node in the
  // case of the Rectangle class).
  if (this._shape) {
    // Round the width to the nearest growth unit (a multiple of the grid to
    // ensure clean width and height).
    width = roundToNearest(width, this._growthUnit, this._growthUnit);

    // Assign it to props.
    this.props.width = width;

    // Manipulate the width in the DOM.
    setSVGAttribute(this._shape, 'width', width);

    // Update the position of the text to align with the new width. (this is a
    // method unique to TextNode).
    this.updateTextPosition();
  } else {
    throw new PaperError(
      'E_NO_ELEM',
      `No shape exists for Node ID: ${this.props.id}`,
      'Rectangle.ts',
      'set width',
    );
  }
}
```

### height

{% hint style="warning" %}
Height get and set **must** be overwritten.
{% endhint %}

#### get

```typescript
get height(): number;
```

External methods need to call `ThisNode.height` in order to calculate various things, and it's not as straightforward as getting it from props \(ex: your component is a circle that takes only radius, so get height must return 2 \* radius\).

For example, here is the height getter in [Rectangle](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeLibrary/Rectangle.ts):

```typescript
get height(): number {
  return this.props.height;
}
```

#### set

```typescript
set height(height: number);
```

You may also wish to adjust the height of this component, and in doing so, you want those changes to be reflected in the DOM automatically. All of the manipulations must be wrapped in setters so updating the DOM is as easy as `ThisNode.height = 200`;

For example, here is the height setter in [Rectangle](https://github.com/liamross/psiagram/blob/master/packages/psiagram/src/components/Node/NodeLibrary/Rectangle.ts):

```typescript
set height(height: number) {
  // Check if shape exists (shape is the actual visual part of the Node in the
  // case of the Rectangle class).
  if (this._shape) {
    // Round the height to the nearest growth unit (a multiple of the grid to
    // ensure clean height and height).
    height = roundToNearest(height, this._growthUnit, this._growthUnit);

    // Assign it to props.
    this.props.height = height;

    // Manipulate the height in the DOM.
    setSVGAttribute(this._shape, 'height', height);

    // Update the position of the text to align with the new height.
    this.updateTextPosition(this.props.width, height);
  } else {
    throw new PaperError(
      'E_NO_ELEM',
      `No shape exists for Node ID: ${this.props.id}`,
      'Rectangle.ts',
      'set height',
    );
  }
}
```

### getElement

```typescript
getElement(): SVGElement;
```

{% hint style="danger" %}
Do not modify or overwrite this function unless you know what you're doing. It is used by the Paper to extract the entire Node group, and breaking the functionality may cause all of Psiagram to work incorrectly.
{% endhint %}

This function will always return the Node group. Any visual components for this Node should be contained within the Node group by adding them using [addToGroup](custom-nodes.md#addtogroup).

### addToGroup

```typescript
addToGroup(element: SVGElement): void;
```

{% hint style="danger" %}
Do not modify or overwrite this function unless you know what you're doing. It should be used by all extending classes to insert SVG elements into the Node group. Breaking the functionality may lead to incorrect rendering of the Node.
{% endhint %}

This function allows you to easily append elements into the Node group. Generally, it is used inside of [initialize](custom-nodes.md#initialize) to add created elements to the Node group.

