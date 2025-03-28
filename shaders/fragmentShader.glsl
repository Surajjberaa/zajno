varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uHover;

void main() {
    float blocks = 20.0;
    vec2 blockUV = floor(vUv * blocks) / blocks;
    float distance = length(blockUV - uMouse);
    float effect = smoothstep(0.25, 0.0, distance);
    
    // Simple distortion without direction
    vec2 distortion = vec2(0.04) * effect;
    vec4 texColor = texture2D(uTexture, vUv + (distortion * uHover));
    
    // Convert to grayscale
    float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    vec4 bwColor = vec4(gray, gray, gray, texColor.a);
    
    // Mix between black/white and texture based on hover
    gl_FragColor = mix(bwColor, texColor, uHover);
}
