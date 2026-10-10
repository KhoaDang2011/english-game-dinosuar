/**
 * Vẽ toàn bộ khung cảnh môi trường, mặt đất, mây, chướng ngại vật và Khủng Long theo đúng Skin đã trang bị.
 */
export class CanvasRenderer {
  static drawScene(ctx, params) {
    const {
      width,
      height,
      groundY,
      groundOffset,
      dinoX,
      dinoY,
      dinoWidth,
      dinoHeight,
      isJumping,
      isCollided,
      legPhase,
      skin,
      obstacles,
      clouds,
      particles,
      questionTargetObstacleId,
    } = params;

    ctx.clearRect(0, 0, width, height);

    // 1. Sky Background Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(1, '#111827');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    // 2. Subtle Stars / Distant Grid Dots
    ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
    for (let i = 0; i < 14; i += 1) {
      const sx = (i * 97) % width;
      const sy = 24 + ((i * 37) % Math.max(60, groundY - 90));
      ctx.fillRect(sx, sy, 2, 2);
    }

    // 3. Clouds
    ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
    for (const cloud of clouds) {
      ctx.beginPath();
      ctx.roundRect(cloud.x, cloud.y, cloud.width, 18, 9);
      ctx.fill();
    }

    // 4. Distant Hills
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= width + 120; x += 120) {
      const hillX = x - ((groundOffset * 0.2) % 120);
      ctx.quadraticCurveTo(hillX + 60, groundY - 28, hillX + 120, groundY);
    }
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();

    // 5. Ground Base & Scrolling Track
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, groundY, width, height - groundY);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Ground pebbles scrolling
    ctx.fillStyle = '#475569';
    const trackStep = 48;
    const offsetMod = groundOffset % trackStep;
    for (let gx = -offsetMod; gx < width; gx += trackStep) {
      ctx.fillRect(gx, groundY + 10, 14, 2);
      ctx.fillRect(gx + 24, groundY + 20, 6, 2);
    }

    // 6. Trail Particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }

    // 7. Obstacles
    for (const obs of obstacles) {
      const isHighlighted = obs.id === questionTargetObstacleId;
      this.drawObstacle(ctx, obs, isHighlighted);
    }

    // 8. Dinosaur Character with Equipped Skin
    this.drawDino(ctx, {
      x: dinoX,
      y: dinoY,
      w: dinoWidth,
      h: dinoHeight,
      isJumping,
      isCollided,
      legPhase,
      skin,
    });
  }

  static drawObstacle(ctx, obs, isHighlighted) {
    ctx.save();

    if (isHighlighted) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(obs.x - 6, obs.y - 6, obs.width + 12, obs.height + 12);
      ctx.setLineDash([]);
    }

    switch (obs.type) {
      case 'CACTUS_SMALL': {
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
          obs.x + obs.width * 0.3,
          obs.y,
          obs.width * 0.4,
          obs.height,
          5
        );
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y + obs.height * 0.25, obs.width * 0.35, 8, 3);
        ctx.roundRect(
          obs.x,
          obs.y + obs.height * 0.12,
          8,
          obs.height * 0.2,
          3
        );
        ctx.fill();
        break;
      }

      case 'CACTUS_CLUSTER': {
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#065f46';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(obs.x + 2, obs.y + 8, 14, obs.height - 8, 4);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(obs.x + 20, obs.y, 16, obs.height, 4);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(obs.x + 40, obs.y + 12, 12, obs.height - 12, 4);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'ROCK_SPIKE': {
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width * 0.3, obs.y + 4);
        ctx.lineTo(obs.x + obs.width * 0.55, obs.y + obs.height * 0.45);
        ctx.lineTo(obs.x + obs.width * 0.78, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'PTERODACTYL': {
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height * 0.5);
        ctx.lineTo(obs.x + obs.width * 0.45, obs.y + obs.height * 0.35);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height * 0.5);
        ctx.lineTo(obs.x + obs.width * 0.45, obs.y + obs.height * 0.68);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const wingUp = Math.sin(obs.wingPhase) > 0;
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.4, obs.y + obs.height * 0.45);
        ctx.lineTo(
          obs.x + obs.width * 0.65,
          wingUp ? obs.y - 8 : obs.y + obs.height + 6
        );
        ctx.lineTo(obs.x + obs.width * 0.78, obs.y + obs.height * 0.5);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  static drawDino(ctx, params) {
    const { x, y, w, h, isJumping, isCollided, legPhase, skin } = params;
    const { visual } = skin;

    ctx.save();

    if (visual.auraColor) {
      ctx.fillStyle = visual.auraColor;
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.5, w * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dorsal Spikes
    ctx.fillStyle = visual.spikeColor;
    for (let i = 0; i < 3; i += 1) {
      const sy = y + 18 + i * 10;
      ctx.beginPath();
      ctx.moveTo(x + 8, sy);
      ctx.lineTo(x + 1, sy + 4);
      ctx.lineTo(x + 8, sy + 8);
      ctx.closePath();
      ctx.fill();
    }

    // Tail
    ctx.fillStyle = visual.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h * 0.52);
    ctx.lineTo(x - 6, y + h * 0.42);
    ctx.lineTo(x - 2, y + h * 0.68);
    ctx.lineTo(x + 14, y + h * 0.72);
    ctx.closePath();
    ctx.fill();

    // Torso
    ctx.fillStyle = visual.primaryColor;
    ctx.strokeStyle = visual.outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 8, y + h * 0.34, w * 0.56, h * 0.46, 6);
    ctx.fill();
    ctx.stroke();

    // Belly Patch
    ctx.fillStyle = visual.bellyColor;
    ctx.beginPath();
    ctx.roundRect(x + w * 0.36, y + h * 0.4, w * 0.24, h * 0.34, 4);
    ctx.fill();

    // Head
    ctx.fillStyle = visual.primaryColor;
    ctx.beginPath();
    ctx.roundRect(x + w * 0.28, y + 2, w * 0.66, h * 0.38, 6);
    ctx.fill();
    ctx.stroke();

    // Eye or Cyber Visor
    if (visual.accessory === 'CYBER_VISOR') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + w * 0.44, y + 7, w * 0.48, 8);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(x + w * 0.48, y + 9, w * 0.42, 4);
    } else if (isCollided) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      const ex = x + w * 0.56;
      const ey = y + 11;
      ctx.beginPath();
      ctx.moveTo(ex - 4, ey - 4);
      ctx.lineTo(ex + 4, ey + 4);
      ctx.moveTo(ex + 4, ey - 4);
      ctx.lineTo(ex - 4, ey + 4);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + w * 0.56, y + 11, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = visual.eyeColor;
      ctx.beginPath();
      ctx.arc(x + w * 0.58, y + 11, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Accessories
    if (visual.accessory === 'HEADBAND') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + w * 0.28, y + 4, w * 0.66, 4);
    } else if (visual.accessory === 'CROWN') {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.36, y + 2);
      ctx.lineTo(x + w * 0.36, y - 8);
      ctx.lineTo(x + w * 0.5, y - 2);
      ctx.lineTo(x + w * 0.6, y - 9);
      ctx.lineTo(x + w * 0.7, y - 2);
      ctx.lineTo(x + w * 0.82, y - 8);
      ctx.lineTo(x + w * 0.82, y + 2);
      ctx.closePath();
      ctx.fill();
    } else if (visual.accessory === 'SCHOLAR_HAT') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + w * 0.3, y - 4, w * 0.58, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + w * 0.82, y - 2, 3, 9);
    } else if (visual.accessory === 'HALO') {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(x + w * 0.6, y - 6, 14, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (visual.accessory === 'HEADPHONES') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + 8, 10, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + w * 0.34, y + 8, 6, 9);
    } else if (visual.accessory === 'HORNS') {
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.38, y + 2);
      ctx.lineTo(x + w * 0.3, y - 8);
      ctx.lineTo(x + w * 0.5, y + 2);
      ctx.moveTo(x + w * 0.56, y + 2);
      ctx.lineTo(x + w * 0.56, y - 9);
      ctx.lineTo(x + w * 0.7, y + 2);
      ctx.fill();
    } else if (visual.accessory === 'WIZARD_HAT') {
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.26, y + 2);
      ctx.lineTo(x + w * 0.56, y - 12);
      ctx.lineTo(x + w * 0.86, y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + w * 0.24, y, w * 0.64, 3);
    } else if (visual.accessory === 'DRAGON_CREST') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.3, y + 2);
      ctx.lineTo(x + w * 0.22, y - 8);
      ctx.lineTo(x + w * 0.46, y - 1);
      ctx.lineTo(x + w * 0.58, y - 10);
      ctx.lineTo(x + w * 0.7, y - 1);
      ctx.lineTo(x + w * 0.86, y - 8);
      ctx.lineTo(x + w * 0.82, y + 2);
      ctx.closePath();
      ctx.fill();
    } else if (visual.accessory === 'ASTRONAUT_HELMET') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
      ctx.beginPath();
      ctx.roundRect(x + w * 0.22, y - 2, w * 0.76, h * 0.44, 8);
      ctx.fill();
      ctx.stroke();
    }

    // Arm
    ctx.strokeStyle = visual.outlineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.64, y + h * 0.52);
    ctx.lineTo(x + w * 0.78, y + h * 0.52);
    ctx.lineTo(x + w * 0.78, y + h * 0.6);
    ctx.stroke();

    // Animated Legs
    const legSwing = isJumping || isCollided ? 0 : Math.sin(legPhase) * 5;
    ctx.fillStyle = visual.secondaryColor;
    ctx.fillRect(
      x + w * 0.22,
      y + h * 0.78 + legSwing,
      8,
      h * 0.22 - legSwing
    );

    ctx.fillStyle = visual.primaryColor;
    ctx.fillRect(
      x + w * 0.44,
      y + h * 0.78 - legSwing,
      9,
      h * 0.22 + legSwing
    );

    ctx.restore();
  }
}
