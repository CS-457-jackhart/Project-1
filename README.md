1. Use GLSL and either glman or the GLSL API to render some geometry (your choice), covered with elliptical dots.
2. Remember that the border of an ellipse, defined in s and t coordinates is:
  
  
      s-sc)2 / Ar2 + (t-tc)2 / Br2 = 1 
  
      Be sure you compute the ellipse centers, sc and tc, correctly.
3. The ellipse parameters must be set as uniform variables. If you are using glman, put them on sliders. If you are using the API, animate them using KeyTime animation.
    
    A glman .glib file might look like this:
    
    ```
    ##OpenGL GLIB
    
    Perspective 90
    LookAt 0 0 2  0 0 0  0 1 0
    
    
    Vertex   oval.vert
    Fragment oval.frag
    Program  Oval				\
    uAd <.001 .1 .5>		\
    uBd <.001 .1 .5>		\
    uTol <0. 0. 1.>
    
    Color 1. .9 0
    Sphere 1 50 50
    ```
    
    This will produce sliders for
    - uAd:	Ellipse diameter for s
    - uBd:	Ellipse diameter for t
    - uTol:	Width of the blend between ellipse and non-ellipse areas

4. If you are using the API, use KeyTime animation to show the effects of uAd, uBd, and uTol:

    ```C++
    // a defined value:
    const int MSEC = 10000;         // 10000 milliseconds = 10 seconds
    
    // a global:
    Keytimes Ad;
    
    
    // in InitGraphics( ):
    Ad.Init( );
    Ad.AddTimeValue(  0.0,  ????? );
    Ad.AddTimeValue(  2.0,  ????? );
    Ad.AddTimeValue(  5.0,  ????? );
    Ad.AddTimeValue(  8.0,  ????? );
    Ad.AddTimeValue( 10.0,  ????? );
    
    
    // in Animate( ):
    glutSetWindow( MainWindow );
    glutPostRedisplay( );
    
    
    // in Display( ):
    // turn # msec into the cycle ( 0 - MSEC-1 ):
    int msec = glutGet( GLUT_ELAPSED_TIME )  %  MSEC;
    
    // turn that into a time in seconds:
    float nowTime = (float)msec  / 1000.;
    
    . . .
    Pattern.SetUniformVariable( "uAd", Ad.GetValue( nowTime ) );
    . . .
    ```

5. Apply per-fragment lighting. In the vertex shader, do something like this:

    ```C++
    #version 330 compatibility
    out vec2 vST; // texture coords
    out vec3 vN; // normal vector
    out vec3 vL; // vector from point to light
    out vec3 vE; // vector from point to eye
    out vec3 vMCposition;
    
    const vec3 LIGHTPOSITION = vec3( 5., 5., 0. );
    
    void
    main( )
    {
      vST = gl_MultiTexCoord0.st;
      vMCposition = gl_Vertex.xyz;
      vec4 ECposition = gl_ModelViewMatrix * gl_Vertex; // eye coordinate position
      vN = normalize( gl_NormalMatrix * gl_Normal ); // normal vector
      vL = LIGHTPOSITION - ECposition.xyz; // vector from the point to the light position
      vE = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point to the eye position
      gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
    }
    ```
    In the fragment shader do this:
    ```C++
    #version 330 compatibility
    // you can set these uniform variables  dynamically or hardwire them:
    uniform float uKa, uKd, uKs; // coefficients of each type of lighting
    uniform float uShininess; // specular exponent
    
    // these have to be set dynamically from glman sliders or keytime animations:
    uniform float uAd, uBd;
    uniform float uTol;
    
    // in variables from the vertex shader:
    in vec2 vST; // texture cords
    in vec3 vN; // normal vector
    in vec3 vL; // vector from point to light
    in vec3 vE; // vector from point to eye
    in vec3 vMCposition;
    
    void
    main( )
    {
      vec3 Normal = normalize(vN);
      vec3 Light = normalize(vL);
      vec3 Eye = normalize(vE);
      vec3 myColor = vec3( ????? );		// whatever default color you'd like
      vec3 mySpecularColor = vec3( ????? );	// whatever default color you'd like
      
      << set myColor by using the ellipse equation to create a smooth blend between the ellipse color and the background color >>
      << now use myColor in the lighting equations >>
      
      // here is the per-fragment lighting:
      vec3 ambient = uKa * myColor;
      float d = 0.;
      float s = 0.;
      if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
      {
        d = dot(Normal,Light);
        vec3 ref = normalize( reflect( -Light, Normal ) ); // reflection vector
        s = pow( max( dot(Eye,ref),0. ), uShininess );
      }
      vec3 diffuse =  uKd * d * myColor;
      vec3 specular = uKs * s * mySpecularColor;
      gl_FragColor = vec4( ambient + diffuse + specular, 1. );
    }
    ```
6. The **uTol** parameter is the width of a **smoothstep( )** blend between the ellipse and non-ellipse areas, thus smoothing the abrupt color transition.


    `float t = smoothstep( 1. - uTol, 1. + uTol, results_of_ellipse_equation );`
    
    Then use **t** in the **mix** function to blend the colors on the edge of the ellipse.

7. The choice of geometry is up to you. Keep it simple at first, then, if there is still time, feel free to get more creative. To try out one of the dragon models, use the GLIB line:

    `Obj dragon010.obj`
    
    or use the API and our LoadObjFile( ) function. the OBJ file needs to be in the same folder as your .cpp, .glib, .vert, and .frag files. 

# Hints
- Use the ellipse equation found in the Stripes, Rings,and Dots notes.
- You can key off of anything you like. (s,t) works well. (x,y,z) works well too, depending on the geometry.
- For some shapes, strange things happen in (s,t) and (x,y,z) around the North and South Poles. Don't worry about this. (This also happens in visualization with longitude-latitude Mercador map projections.)

