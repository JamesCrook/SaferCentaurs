# Omni Viewer UIs

OmniChart, OmniGrid, OmniCard and OmniSlice are three morphing data viewers.

Parameters in the control panel give considerable flexibility into how exactly data is displayed. Preset buttons provide some useful combinations of diisplay parameters.

The interfaces have been designed with some thought to mobile use. On landscape mode screens the control panel is to the right. As the screen becomes narrower, the controls drop below. The switch over is intended to maximise the display area for the data, whilst still always giving at least the minimum for the controls. Tabbed dividers on the control panel left help to navigate what can be a long list of adjustments.

The OmniViewers attempt to show the full configurable range of the data viewers. In end user apps, the data viewer will usually be customised to restrict the configurable options to the ones most relevant for the task. 

----

## OmniChart

Covers many basic chart types that can be derived from a collection of data series.
* Bar Charts - Stacked bars of different colours
* Pie Charts and Donuts - Wedges of colour
* Spider Chart - Radial plot of the same data
* Line Chart - Just the top edges of the bars, suitably angled

The unusual feature is that these options are broken down into component factors, that can be morphed between

### Data

The data in OmniChart can be filtered and sorted, to choose what to present. The 'focus' category is the one that is first in the list.

## OmniGrid

A table display that when zoomed out gives a heatmap
* Blobs - replace the numbers by circular blobs
* Distance mode - Show the 'second copy' of any distance in a faded out colour. Completely fading out, you get a triangular grid rather than a square.

The indexes can be run forwards or in reverse. In disatnce mode it is usual to reverse the order of columns, so as to get all strongly shown values in the upper left triangle.

## OmniSlice

A 3D cross section through the Earth. Parameters select a wedge to cut from it.

## OmniCard

Styled divs, presented as a primitive Anki-card app

----

## AsciiTree 

A tree data display, mainly for documentation. Drop a file tree into the drop zone, and you get text which you can paste into a document as ASCII art. The copy button is at the end of the control panel.

----

## LCARs

A Start Trek inspired user interface, set up tp look at protein structures using the NGL viewer.

----

## Small Sound

Very simple blip-and-boop sound effects. The same curves that do loudness and pitch envelopes can be used for both sampled and continuous sounds.  