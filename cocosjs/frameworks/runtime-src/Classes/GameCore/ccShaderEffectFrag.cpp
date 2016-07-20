#include "ccShaderEffectFrag.h"

#define STRINGIFY(A)  #A

const GLchar* ccShader_GreyScale_Frag = STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	 vec4 c = texture2D(CC_Texture0, v_texCoord);
		  gl_FragColor.xyz = vec3(0.2126*c.r + 0.7152*c.g + 0.0722*c.b);
	   	gl_FragColor.w = c.w;
    }                                        
);

const GLchar * ccShader_Banish_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	vec4 c = texture2D(CC_Texture0, v_texCoord) * v_fragmentColor;
      	float gray = (c.r + c.g + c.b) * (1.0 / 3.0);
      	gl_FragColor = vec4(gray * 0.9, gray * 1.2, gray * 0.8, c.a * (gray + 0.1));
    }                                        
);


const GLchar * ccShader_Fire_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	gl_FragColor = texture2D(CC_Texture0, v_texCoord) * v_fragmentColor;
      	gl_FragColor.r = gl_FragColor.r * 1.4;
      	gl_FragColor.r = gl_FragColor.r + 0.08 * gl_FragColor.a;
      	gl_FragColor.g = gl_FragColor.g  + 0.2 * gl_FragColor.a;
    }                                        
);


const GLchar * ccShader_Frozen_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	vec4 normalColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
      	normalColor *= vec4(0.8, 1, 0.8, 1);
      	normalColor.b += normalColor.a * 0.2;
      	gl_FragColor = normalColor;
    }                                        
);


const GLchar * ccShader_GrayScaling_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	vec4 normalColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
      	float gray = dot(normalColor.rgb, vec3(0.299 * 0.5, 0.587 * 0.5, 0.114 * 0.5));
      	gl_FragColor = vec4(gray, gray, gray, normalColor.a * 0.5);
    }                                        
);


const GLchar * ccShader_Ice_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	vec4 color1 = texture2D(CC_Texture0, v_texCoord) * v_fragmentColor;
      	float brightness = (color1.r + color1.g + color1.b) * (1. / 3.);
      	float gray = (1.5)*brightness;
      	color1 = vec4(gray, gray, gray, color1.a)*vec4(0.8,1.2,1.5,1);
      	gl_FragColor =color1;
    }                                        
);


const GLchar * ccShader_Mirror_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	vec4 normalColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
      	normalColor.r = normalColor.r * 0.5;
      	normalColor.g = normalColor.g * 0.8;
      	normalColor.b = normalColor.b + normalColor.a * 0.2;
      	gl_FragColor = normalColor;
    }                                        
);


const GLchar * ccShader_Poison_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	gl_FragColor = texture2D(CC_Texture0, v_texCoord) * v_fragmentColor;
      	gl_FragColor.r *= 0.8;
      	gl_FragColor.r += 0.08 * gl_FragColor.a;
      	gl_FragColor.g *= 0.8;
      	gl_FragColor.b *= 0.8;
      	gl_FragColor.g += 0.2 * gl_FragColor.a;
    }                                        
);


const GLchar * ccShader_Stone_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	vec4 color1 = texture2D(CC_Texture0, v_texCoord) * v_fragmentColor;
      	float brightness = (color1.r + color1.g + color1.b) * (1. / 3.);
      	float gray = (0.6) * brightness;
      	gl_FragColor = vec4(gray, gray, gray, color1.a);
    }                                        
);


const GLchar * ccShader_Vanish_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
    	   gl_FragColor = texture2D(CC_Texture0, v_texCoord) * v_fragmentColor;
      	float gray = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) * (1.0 / 3.0);
      	gl_FragColor = vec4(gray * 0.8, gray * 0.8, gray * 0.8, gl_FragColor.a * (gray + 0.1));
    }                                        
);


const GLchar * ccShader_Outline_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;

    uniform vec3 u_outlineColor;
    uniform float u_threshold;
    uniform float u_radius;
                                            
    void main(void)
    {
        float radius = u_radius;
        vec4 accum = vec4(0.0);
        vec4 normal = vec4(0.0);
    
        normal = texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
    
        accum += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y - radius));
        accum += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y - radius));
        accum += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y + radius));
        accum += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y + radius));
    
        accum *= u_threshold;
        accum.rgb =  u_outlineColor * accum.a;
        normal = ( accum * (1.0 - normal.a)) + (normal * normal.a);
        gl_FragColor = v_fragmentColor * normal;
    }                                        
);


const GLchar * ccShader_Sepia_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;
                                            
    void main(void)
    {
      vec4 c = texture2D(CC_Texture0, v_texCoord);
      vec4 final = c;
      final.r = (c.r * 0.393) + (c.g * 0.769) + (c.b * 0.189);
      final.g = (c.r * 0.349) + (c.g * 0.686) + (c.b * 0.168);
      final.b = (c.r * 0.272) + (c.g * 0.534) + (c.b * 0.131);

      gl_FragColor = final;
    }                                        
);


const GLchar * ccShader_Bloom_Frag= STRINGIFY(
#ifdef GL_ES
    precision mediump float;
#endif
                                                
    varying vec4 v_fragmentColor;
    varying vec2 v_texCoord;

    uniform vec2 resolution;
    const float blurSize = 1.0/512.0;
    const float intensity = 0.35;                       
    void main(void)
    {
      vec4 sum = vec4(0);
   vec2 texcoord = v_texCoord.xy;
   int j;
   int i;

   sum += texture2D(CC_Texture0, vec2(texcoord.x - 4.0*blurSize, texcoord.y)) * 0.05;
   sum += texture2D(CC_Texture0, vec2(texcoord.x - 3.0*blurSize, texcoord.y)) * 0.09;
   sum += texture2D(CC_Texture0, vec2(texcoord.x - 2.0*blurSize, texcoord.y)) * 0.12;
   sum += texture2D(CC_Texture0, vec2(texcoord.x - blurSize, texcoord.y)) * 0.15;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y)) * 0.16;
   sum += texture2D(CC_Texture0, vec2(texcoord.x + blurSize, texcoord.y)) * 0.15;
   sum += texture2D(CC_Texture0, vec2(texcoord.x + 2.0*blurSize, texcoord.y)) * 0.12;
   sum += texture2D(CC_Texture0, vec2(texcoord.x + 3.0*blurSize, texcoord.y)) * 0.09;
   sum += texture2D(CC_Texture0, vec2(texcoord.x + 4.0*blurSize, texcoord.y)) * 0.05;
  
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y - 4.0*blurSize)) * 0.05;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y - 3.0*blurSize)) * 0.09;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y - 2.0*blurSize)) * 0.12;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y - blurSize)) * 0.15;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y)) * 0.16;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y + blurSize)) * 0.15;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y + 2.0*blurSize)) * 0.12;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y + 3.0*blurSize)) * 0.09;
   sum += texture2D(CC_Texture0, vec2(texcoord.x, texcoord.y + 4.0*blurSize)) * 0.05;

   gl_FragColor = sum*intensity + texture2D(CC_Texture0, texcoord); 
    }                                        
);



