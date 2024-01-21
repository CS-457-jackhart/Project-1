#version 330 compatibility

// lighting uniform variables -- these can be set once and left alone:
uniform float   uKa, uKd, uKs;	// coefficients of each type of lighting -- make sum to 1.0
uniform vec3    uColor;			// object color
uniform vec3    uSpecularColor;	// light color
uniform float   uShininess;		// specular exponent

// square-equation uniform variables -- these should be set every time Display( ) is called:

uniform float	 uDiam_a;			// Diameter of dots width
uniform float	 uDiam_b;			// Diamater of dots height

// in variables from the vertex shader and interpolated in the rasterizer:

in  vec3  vN;		   // normal vector
in  vec3  vL;		   // vector from point to light
in  vec3  vE;		   // vector from point to eye
in  vec2  vST;		   // (s,t) texture coordinates


void
main( )
{
	float s = vST.s;
	float t = vST.t;

	// determine the color using the ellipse-boundary equations:

	float rad_a = uDiam_a / 2.;
	float rad_b = uDiam_b / 2.;
	int numins = int(s / uDiam_a);
	int numint = int(t / uDiam_b);
	float s_c = numins * uDiam_a + rad_a;
	float t_c = numint * uDiam_b + rad_b;

	vec3 myColor = uColor;
	float s_pow = pow((s - s_c) / rad_a, 2);
	float t_pow = pow((t - t_c) / rad_b, 2);
	if (s_pow + t_pow <= 1)
	{
		myColor = vec3( 1., 0., 0. );
	}

	// apply the per-fragment lighting to myColor:

	vec3 Normal = normalize(vN);
	vec3 Light  = normalize(vL);
	vec3 Eye    = normalize(vE);

	vec3 ambient = uKa * myColor;

	float dd = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
	vec3 diffuse = uKd * dd * myColor;

	float ss = 0.;
	if( dot(Normal,Light) > 0. )	      // only do specular if the light can see the point
	{
		vec3 ref = normalize(  reflect( -Light, Normal )  );
		ss = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * ss * uSpecularColor;
	gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}

