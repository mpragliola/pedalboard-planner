






Every device template will have a "shape" optional property.
When absent, it will default to "box", otherwise it will define a shape and its parameters.

The idea is to have a few primitives different than a box (cuboid), so that we can cover
the majority of pedals with slightly more realistic 3d representation.
The shapes will be still very simple.

The shapes:

1) WEDGE (alias "wedge")

Similar to a cuboid but with trapezoidal section, used mainly for tilted multifx: 
- bottom face is normal
- top face is tiltet towards the user
- front face is 80% shorter than back face. both are still orthogonal to the plane.
- side faces are trapezes and orthogonal
PARAMETER(S):
- ratio: 0-100%, how much the front face is inr espect of the back face

2) BOSS-TYPE-PEDAL ("pedal-boss-type")

Similar to a cuboid, but with a step. Another word to describe this solid, is a cuboid
where a smaller cubouid is subtracted from the back upper part
The side section looks like this:
       --------
       |      |        
-------|      |
|             |
|-------------|
PARAMETER(S):
- ratio 0-100%, size of the "step" or how much of the top face it subdivides

3) WAH ("wah")

It's similar to a cuboid, but the top face is trapezoidal, and the edge facing
the user is 20% shorter. 
no params

4) HALF-WEDGE

It's a cuboid where only part of the top face gets tilted. It can also be
thought as the union of a cuboid and a wedge of same height. 
- bottom face is normal
- top face is partly parallel to the ground, partly tilted. The tilt faces the user.
PARAMETER(S):
- top ratio (how much of the top face is tilted)
- front ratio (how steep is the tilt, in % of how the front face is in respect of the back face)

5) RAIL-WEDGE

It's similar to a wedge
but a central part of the face has a rail, a horizontal part that is raised 
PARAMETER(S):
- % position: position of the rail from the top edge
- % rail: how much the rail occupies of the top face
- % ratio: how much is the tilt in terms of % of the front face in respoect of the bacck face