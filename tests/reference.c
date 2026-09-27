/* Build against the preserved R7, never the newer working N64 source. */
#include "surf.h"
#include <stdio.h>
int main(void){surf_math_init();for(int mode=0;mode<5;mode++){Surf s;surf_reset(&s);if(mode==4){s.position.y+=0.4f;s.velocity.y=-110;s.grounded=false;}for(int i=0;i<360;i++){SurfInput in={mode==2?0.45f:0,mode==3?1:0,mode==1||mode==2||mode==4};surf_step(&s,in,1.0f/120);if(i==0||i==5||i==119||i==359)printf("%d %d %.8f %.8f %.8f %.8f %.8f %.8f %u %u\n",mode,i+1,s.position.x,s.position.y,s.position.z,s.velocity.y,s.speed,s.sink,s.launches,s.landings);}}return 0;}
