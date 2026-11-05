import { useState, useEffect, useRef } from 'react';

// ============ Voxel Cube Component ============
function VoxelCube({ color = 'green', size = 40, className = '' }: { color?: string; size?: number; className?: string }) {
  const colors: Record<string, string[]> = {
    green: ['rgba(74,222,128,0.8)', 'rgba(34,130,100,0.8)', 'rgba(50,180,110,0.8)', 'rgba(60,200,120,0.8)', 'rgba(100,255,150,0.9)', 'rgba(30,100,70,0.8)'],
    orange: ['rgba(251,146,60,0.8)', 'rgba(180,80,20,0.8)', 'rgba(220,120,40,0.8)', 'rgba(240,130,50,0.8)', 'rgba(255,180,80,0.9)', 'rgba(150,60,10,0.8)'],
    red: ['rgba(248,113,113,0.8)', 'rgba(180,50,50,0.8)', 'rgba(210,80,80,0.8)', 'rgba(230,90,90,0.8)', 'rgba(255,140,140,0.9)', 'rgba(140,30,30,0.8)'],
    cyan: ['rgba(34,211,238,0.8)', 'rgba(10,120,140,0.8)', 'rgba(20,170,200,0.8)', 'rgba(28,190,220,0.8)', 'rgba(80,240,255,0.9)', 'rgba(5,90,110,0.8)'],
    purple: ['rgba(167,139,250,0.8)', 'rgba(100,70,200,0.8)', 'rgba(130,100,220,0.8)', 'rgba(150,120,240,0.8)', 'rgba(200,170,255,0.9)', 'rgba(70,40,160,0.8)'],
    yellow: ['rgba(251,191,36,0.8)', 'rgba(180,120,10,0.8)', 'rgba(220,160,20,0.8)', 'rgba(240,175,30,0.8)', 'rgba(255,220,80,0.9)', 'rgba(140,90,5,0.8)'],
  };
  const c = colors[color] || colors.green;
  const half = size / 2;

  return (
    <div className={`voxel-cube ${className}`} style={{ width: size, height: size }}>
      <div className="face" style={{ width: size, height: size, transform: `translateZ(${half}px)`, background: c[0], border: '1px solid rgba(255,255,255,0.1)' }} />
      <div className="face" style={{ width: size, height: size, transform: `translateZ(-${half}px) rotateY(180deg)`, background: c[1], border: '1px solid rgba(255,255,255,0.1)' }} />
      <div className="face" style={{ width: size, height: size, transform: `translateX(-${half}px) rotateY(-90deg)`, background: c[2], border: '1px solid rgba(255,255,255,0.1)' }} />
      <div className="face" style={{ width: size, height: size, transform: `translateX(${half}px) rotateY(90deg)`, background: c[3], border: '1px solid rgba(255,255,255,0.1)' }} />
      <div className="face" style={{ width: size, height: size, transform: `translateY(-${half}px) rotateX(90deg)`, background: c[4], border: '1px solid rgba(255,255,255,0.1)' }} />
      <div className="face" style={{ width: size, height: size, transform: `translateY(${half}px) rotateX(-90deg)`, background: c[5], border: '1px solid rgba(255,255,255,0.1)' }} />
    </div>
  );
}

// ============ Floating Voxels Background ============
function FloatingVoxels() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[10%] left-[10%] animate-float" style={{ animationDelay: '0s' }}>
        <VoxelCube color="green" size={30} />
      </div>
      <div className="absolute top-[20%] right-[15%] animate-float-delay" style={{ animationDelay: '1s' }}>
        <VoxelCube color="orange" size={25} />
      </div>
      <div className="absolute top-[60%] left-[5%] animate-float-delay-2" style={{ animationDelay: '2s' }}>
        <VoxelCube color="cyan" size={20} />
      </div>
      <div className="absolute top-[40%] right-[8%] animate-float" style={{ animationDelay: '3s' }}>
        <VoxelCube color="red" size={35} />
      </div>
      <div className="absolute bottom-[20%] left-[20%] animate-float-delay" style={{ animationDelay: '1.5s' }}>
        <VoxelCube color="purple" size={22} />
      </div>
      <div className="absolute bottom-[30%] right-[20%] animate-float-delay-2" style={{ animationDelay: '4s' }}>
        <VoxelCube color="yellow" size={28} />
      </div>
      <div className="absolute top-[70%] left-[50%] animate-float" style={{ animationDelay: '2.5s' }}>
        <VoxelCube color="green" size={18} />
      </div>
      <div className="absolute top-[15%] left-[45%] animate-float-delay" style={{ animationDelay: '0.5s' }}>
        <VoxelCube color="cyan" size={15} />
      </div>
    </div>
  );
}

// ============ Section Observer Hook ============
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ============ Navigation ============
function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'py-5 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-400 rounded-sm flex items-center justify-center">
            <span className="text-xs font-bold text-black">VT</span>
          </div>
          <span className="font-bold text-lg text-white">Voxel Tanks</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#concept" className="text-sm text-gray-400 hover:text-green-400 transition-colors">Концепция</a>
          <a href="#platform" className="text-sm text-gray-400 hover:text-green-400 transition-colors">Платформа</a>
          <a href="#tech" className="text-sm text-gray-400 hover:text-green-400 transition-colors">Технологии</a>
          <a href="#roadmap" className="text-sm text-gray-400 hover:text-green-400 transition-colors">Roadmap</a>
          <a href="#status" className="text-sm text-gray-400 hover:text-green-400 transition-colors">Статус</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-green-400">В разработке</span>
        </div>
      </div>
    </nav>
  );
}

// ============ Hero Section ============
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center grid-bg overflow-hidden">
      <FloatingVoxels />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0f0d]"></div>
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="relative" style={{ perspective: '800px' }}>
            <div className="animate-float" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(30deg)' }}>
              <VoxelCube color="green" size={80} />
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
          <span className="gradient-text">VOXEL</span>
          <br />
          <span className="text-white">TANKS</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
          Возрождение классических <span className="text-green-400 font-semibold">«Танчиков»</span> в воксельной стилистике Minecraft
        </p>
        <p className="text-lg text-gray-500 mb-10">
          Современная физика разрушений • Smart TV • Ностальгия + Технологии
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="#concept" className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold rounded-lg hover:scale-105 transition-transform animate-pulse-glow">
            Узнать больше
          </a>
          <a href="#roadmap" className="px-8 py-3 border border-green-500/30 text-green-400 font-bold rounded-lg hover:bg-green-500/10 transition-colors">
            Дорожная карта →
          </a>
        </div>
        
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">30-60</div>
            <div className="text-xs text-gray-500">FPS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">2 ГБ</div>
            <div className="text-xs text-gray-500">мин. ОЗУ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">20-50</div>
            <div className="text-xs text-gray-500">МБ APK</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Concept Section ============
function ConceptSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section id="concept" ref={ref} className="py-24 px-6">
      <div className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-semibold tracking-wider uppercase">Концепция</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Бестселлер для <span className="gradient-text">Smart TV</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Убираем барьеры входа: не нужна консоль за $500, игра уже есть у всех дома. 
            Объединяем ностальгию по Dendy с современными технологиями.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon="🎮"
            title="Ностальгия"
            description="Battle City / Tank 1990 — культовая игра с Dendy, знакомая миллионам. Простые правила, мгновенное вовлечение."
            color="green"
          />
          <FeatureCard
            icon="🧊"
            title="Воксельный стиль"
            description="Кубики как в Minecraft — узнаваемый стиль, эффективный рендеринг через GPU Instancing, бесконечная разрушаемость."
            color="cyan"
          />
          <FeatureCard
            icon="📺"
            title="Smart TV"
            description="Android TV как стартовая платформа. Игра есть у каждого в гостиной. Дистрибуция через Google Play."
            color="orange"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  const borderColors: Record<string, string> = {
    green: 'hover:border-green-500/50',
    cyan: 'hover:border-cyan-500/50',
    orange: 'hover:border-orange-500/50',
  };
  
  return (
    <div className={`p-6 rounded-xl bg-[#111a15] border border-[#1e3a2a] ${borderColors[color]} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/5`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

// ============ Platform Section ============
function PlatformSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section id="platform" ref={ref} className="py-24 px-6 bg-gradient-to-b from-[#0a0f0d] via-[#0d1a12] to-[#0a0f0d]">
      <div className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Платформа</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Почему <span className="gradient-text">Smart TV</span>?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <PlatformStep
              number="01"
              title="Android TV / Google TV"
              description="Единая экосистема, большая база устройств, простая дистрибуция через Google Play"
              active
            />
            <PlatformStep
              number="02"
              title="Tizen (Samsung)"
              description="Портирование после успеха на Android TV — охват умных телевизоров Samsung"
            />
            <PlatformStep
              number="03"
              title="WebOS (LG)"
              description="Расширение на экосистему LG Smart TV"
            />
            <PlatformStep
              number="04"
              title="ПК / Консоли"
              description="Масштабирование на традиционные игровые платформы"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              {/* TV frame */}
              <div className="w-80 h-52 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 shadow-2xl shadow-green-500/10">
                <div className="w-full h-full bg-[#0a0f0d] rounded-md flex items-center justify-center overflow-hidden relative">
                  <div className="grid-bg absolute inset-0 opacity-50"></div>
                  <div className="relative z-10 text-center">
                    <div className="flex justify-center gap-1 mb-2">
                      <VoxelCube color="green" size={12} />
                      <VoxelCube color="green" size={12} />
                      <VoxelCube color="orange" size={12} />
                      <VoxelCube color="green" size={12} />
                    </div>
                    <div className="text-xs text-green-400 font-mono">VOXEL TANKS</div>
                    <div className="text-[10px] text-gray-500 mt-1">Level 1-1</div>
                  </div>
                </div>
              </div>
              {/* TV stand */}
              <div className="w-20 h-3 bg-gray-700 mx-auto rounded-b-md"></div>
              <div className="w-32 h-2 bg-gray-800 mx-auto rounded-b-md"></div>
              {/* Controller */}
              <div className="mt-6 flex justify-center">
                <div className="bg-gray-800 rounded-full px-6 py-3 flex items-center gap-4 border border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <div className="w-8 h-4 bg-gray-700 rounded-sm flex items-center justify-center">
                    <span className="text-[8px] text-gray-400">OK</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformStep({ number, title, description, active = false }: { number: string; title: string; description: string; active?: boolean }) {
  return (
    <div className={`flex gap-4 p-4 rounded-lg transition-all ${active ? 'bg-green-500/10 border border-green-500/30' : 'hover:bg-white/5'}`}>
      <div className={`text-2xl font-black ${active ? 'text-green-400' : 'text-gray-600'}`}>{number}</div>
      <div>
        <h4 className={`font-bold ${active ? 'text-green-400' : 'text-white'}`}>{title}</h4>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

// ============ Controls Section ============
function ControlsSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section ref={ref} className="py-24 px-6">
      <div className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">Управление</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Гибридная <span className="gradient-text-warm">система</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Три способа управления — от пульта ДУ до смартфона
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ControlCard
            icon="📱"
            title="Пульт ДУ"
            items={['Стрелки = движение', 'ОК = стрельба', 'Назад = пауза']}
            badge="Базовый"
          />
          <ControlCard
            icon="🎮"
            title="Геймпад"
            items={['Любые геймпады', 'Включая китайские реплики', 'Ручной маппинг кнопок']}
            badge="Рекомендуемый"
            highlight
          />
          <ControlCard
            icon="📲"
            title="Смартфон"
            items={['QR-код в браузере', 'Без установки приложений', 'Виброотдача']}
            badge="Инновация"
          />
        </div>
      </div>
    </section>
  );
}

function ControlCard({ icon, title, items, badge, highlight = false }: { icon: string; title: string; items: string[]; badge: string; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${highlight ? 'bg-gradient-to-b from-green-500/10 to-transparent border-green-500/30' : 'bg-[#111a15] border-[#1e3a2a] hover:border-orange-500/30'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${highlight ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>{badge}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============ Tech Section ============
function TechSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section id="tech" ref={ref} className="py-24 px-6 bg-gradient-to-b from-[#0a0f0d] via-[#0d1a12] to-[#0a0f0d]">
      <div className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Технологии</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Движок: <span className="gradient-text">Godot 4</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Лёгкий, мощный, с официальной поддержкой Android и встроенным 3D-рендерером
          </p>
        </div>

        {/* Engine comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 rounded-xl bg-[#111a15] border border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold">G</span>
              </div>
              <div>
                <h3 className="font-bold text-green-400">Godot 4</h3>
                <span className="text-xs text-gray-500">Выбран ✓</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 100 МБ размер движка</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> GDScript — простой как Python</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Экспорт в Android из коробки</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> MultiMeshInstance3D для вокселей</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Визуальный редактор шейдеров</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Open Source, без роялти</li>
            </ul>
          </div>

          <div className="space-y-3">
            <RejectedEngine name="Unreal Engine" reason="Слишком тяжёлый (30+ ГБ), не запустится на слабом ТВ" />
            <RejectedEngine name="Unity" reason="C# сложнее, сам движок тяжеловат для ТВ" />
            <RejectedEngine name="Construct / GDevelop" reason="Только 2D — не подходит для воксельного стиля" />
          </div>
        </div>

        {/* Optimization techniques */}
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Оптимизация для слабого железа</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OptimCard
            icon="⚡"
            title="GPU Instancing"
            description="MultiMeshInstance3D — тысячи кубиков одним вызовом"
          />
          <OptimCard
            icon="💡"
            title="Baked Lighting"
            description="Запечённое освещение + динамические тени только для снарядов"
          />
          <OptimCard
            icon="🧮"
            title="Математика физики"
            description="Разрушаемость через массивы данных, не физика каждого кубика"
          />
          <OptimCard
            icon="📦"
            title="Стриминг вокселей"
            description="Загружаем только видимые блоки в поле зрения камеры"
          />
        </div>
      </div>
    </section>
  );
}

function RejectedEngine({ name, reason }: { name: string; reason: string }) {
  return (
    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-400 text-sm">✗</span>
        <span className="font-semibold text-gray-300">{name}</span>
      </div>
      <p className="text-xs text-gray-500 ml-5">{reason}</p>
    </div>
  );
}

function OptimCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg bg-[#111a15] border border-[#1e3a2a] hover:border-purple-500/30 transition-all">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

// ============ Camera Section ============
function CameraSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section ref={ref} className="py-24 px-6">
      <div className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-yellow-400 text-sm font-semibold tracking-wider uppercase">Камера</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Изометрия → <span className="gradient-text">3D</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-[#111a15] border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">Сначала</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Изометрическая камера</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Projection: Orthogonal</li>
              <li>• Rotation: X=-45°, Y=-45°</li>
              <li>• Проще для управления с пульта</li>
              <li>• Лучше производительность</li>
              <li>• Классический вид Battle City</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-[#111a15] border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">Потом</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">От третьего лица</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Дополнительный режим камеры</li>
              <li>• Более иммерсивный опыт</li>
              <li>• Добавляется после успеха MVP</li>
              <li>• Показывает воксельную детализацию</li>
              <li>• Как бонус для «продвинутых» игроков</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Roadmap Section ============
function RoadmapSection() {
  const { ref, isVisible } = useInView();
  
  const stages = [
    {
      phase: 'Этап 1',
      title: 'MVP',
      status: 'current' as const,
      color: 'green',
      items: [
        'Один танк, одна стена, базовая стрельба',
        'Разрушаемость кирпича (удаление кубиков)',
        'Изометрическая камера',
        'Управление с клавиатуры/геймпада',
        'Тестирование на Android TV',
      ],
    },
    {
      phase: 'Этап 2',
      title: 'Полировка',
      status: 'next' as const,
      color: 'cyan',
      items: [
        'Воксельные модели танков',
        'Эффекты частиц (взрывы, дым)',
        'Звуки и музыка',
        'Базовый ИИ врагов',
        'Меню и UI',
      ],
    },
    {
      phase: 'Этап 3',
      title: 'Релиз на Android TV',
      status: 'future' as const,
      color: 'orange',
      items: [
        '10-15 уровней или процедурная генерация',
        'Система прогрессии (апгрейды танка)',
        'Локальный кооператив на 2 игрока',
        'Управление со смартфона через QR-код',
        'Оптимизация под разные чипы (Mali, Adreno)',
      ],
    },
    {
      phase: 'Этап 4',
      title: 'Масштабирование',
      status: 'future' as const,
      color: 'purple',
      items: [
        'Портирование на Tizen / WebOS',
        'Камера от третьего лица',
        'Онлайн-мультиплеер',
        'Редактор уровней + Steam Workshop',
      ],
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  };

  return (
    <section id="roadmap" ref={ref} className="py-24 px-6 bg-gradient-to-b from-[#0a0f0d] via-[#0d1a12] to-[#0a0f0d]">
      <div className={`max-w-5xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-semibold tracking-wider uppercase">Дорожная карта</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Путь к <span className="gradient-text">релизу</span>
          </h2>
        </div>

        <div className="space-y-6">
          {stages.map((stage, idx) => {
            const c = colorMap[stage.color];
            return (
              <div key={idx} className={`relative p-6 rounded-xl border ${c.border} ${c.bg} ${stage.status === 'current' ? 'ring-1 ring-green-500/50' : ''}`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                    {stage.phase}
                  </span>
                  <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                  {stage.status === 'current' && (
                    <span className="flex items-center gap-1 text-xs text-green-400 ml-auto">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      В процессе
                    </span>
                  )}
                  {stage.status === 'next' && (
                    <span className="text-xs text-cyan-400 ml-auto">Следующий →</span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {stage.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============ Godot Structure Section ============
function GodotStructureSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section ref={ref} className="py-24 px-6">
      <div className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Архитектура</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Структура в <span className="gradient-text">Godot</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Node tree */}
          <div className="p-6 rounded-xl bg-[#111a15] border border-[#1e3a2a]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">🌳</span> Дерево сцены (Tank)
            </h3>
            <div className="font-mono text-sm space-y-1">
              <TreeNode name="CharacterBody3D" type="root" indent={0} />
              <TreeNode name="MeshInstance3D" type="visual" indent={1} desc="BoxMesh для вокселей" />
              <TreeNode name="CollisionShape3D" type="physics" indent={1} desc="Физическая форма" />
              <TreeNode name="Camera3D" type="camera" indent={1} desc="Orthogonal, -45°/-45°" />
              <TreeNode name="RayCast3D" type="ray" indent={1} desc="Наведение снарядов" />
              <TreeNode name="GPUParticles3D" type="particles" indent={1} desc="Взрывы, дым, искры" />
              <TreeNode name="AudioStreamPlayer" type="audio" indent={1} desc="Звуки выстрелов" />
            </div>
          </div>

          {/* Code snippet */}
          <div className="p-6 rounded-xl bg-[#111a15] border border-[#1e3a2a]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">📝</span> Пример GDScript
            </h3>
            <pre className="text-xs text-gray-400 overflow-x-auto">
              <code>{`extends CharacterBody3D

const SPEED = 5.0
const BULLET_SCENE = preload("res://bullet.tscn")

func _physics_process(delta):
    var input = Input.get_vector(
        "left", "right", "up", "down"
    )
    velocity = input * SPEED
    move_and_slide()
    
    if Input.is_action_just_pressed("shoot"):
        var bullet = BULLET_SCENE.instantiate()
        bullet.position = $Muzzle.position
        bullet.direction = transform.basis.z
        get_tree().root.add_child(bullet)`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function TreeNode({ name, type, indent, desc }: { name: string; type: string; indent: number; desc?: string }) {
  const icons: Record<string, string> = {
    root: '🟢',
    visual: '🎨',
    physics: '⚙️',
    camera: '📷',
    ray: '🔫',
    particles: '✨',
    audio: '🔊',
  };
  
  return (
    <div className="flex items-center gap-2" style={{ paddingLeft: `${indent * 20}px` }}>
      {indent > 0 && <span className="text-gray-600">└─</span>}
      <span>{icons[type]}</span>
      <span className="text-green-400">{name}</span>
      {desc && <span className="text-gray-600 text-xs ml-2">// {desc}</span>}
    </div>
  );
}

// ============ Status Section ============
function StatusSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section id="status" ref={ref} className="py-24 px-6 bg-gradient-to-b from-[#0a0f0d] via-[#0d1a12] to-[#0a0f0d]">
      <div className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-semibold tracking-wider uppercase">Текущий статус</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Где мы <span className="gradient-text">сейчас</span>
          </h2>
        </div>

        <div className="p-8 rounded-xl bg-[#111a15] border border-green-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold">Установка и изучение Godot 4</span>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Прогресс MVP</span>
              <span className="text-green-400">5%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all duration-1000" style={{ width: '5%' }}></div>
            </div>
          </div>

          <h4 className="font-bold text-white mb-4">Следующие шаги:</h4>
          <div className="space-y-3">
            <NextStep number={1} text="Создать базовую сцену с кубиком и изометрической камерой" />
            <NextStep number={2} text="Добавить базовое движение танка" />
            <NextStep number={3} text="Реализовать стрельбу и простую разрушаемость" />
          </div>

          <div className="mt-8 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="text-sm text-gray-400">
              <span className="text-green-400 font-semibold">Методология:</span> Вайбкодинг — описываешь задачу конкретным промптом → AI генерирует GDScript код → тестируешь в Godot → корректировки на основе результатов.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Дата начала: 12 августа 2026 • Основная цель: бестселлер для Smart TV
          </p>
        </div>
      </div>
    </section>
  );
}

function NextStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
        {number}
      </div>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
}

// ============ Visual Style Section ============
function VisualStyleSection() {
  const { ref, isVisible } = useInView();
  
  return (
    <section ref={ref} className="py-24 px-6">
      <div className={`max-w-6xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">Визуальный стиль</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">
            Воксельная <span className="gradient-text-warm">графика</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#111a15] border border-[#1e3a2a] text-center">
            <div className="flex justify-center gap-1 mb-4">
              <VoxelCube color="green" size={25} />
              <VoxelCube color="green" size={25} />
              <VoxelCube color="orange" size={25} />
              <VoxelCube color="green" size={25} />
              <VoxelCube color="green" size={25} />
            </div>
            <h3 className="font-bold text-white mb-2">Кубики как в Minecraft</h3>
            <p className="text-sm text-gray-400">Узнаваемый стиль, эффективный рендеринг</p>
          </div>

          <div className="p-6 rounded-xl bg-[#111a15] border border-[#1e3a2a] text-center">
            <div className="flex justify-center gap-1 mb-4">
              <VoxelCube color="orange" size={20} />
              <VoxelCube color="red" size={20} />
              <VoxelCube color="yellow" size={20} />
              <VoxelCube color="orange" size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">Современное освещение</h3>
            <p className="text-sm text-gray-400">Динамические тени, эффекты частиц</p>
          </div>

          <div className="p-6 rounded-xl bg-[#111a15] border border-[#1e3a2a] text-center">
            <div className="flex justify-center gap-1 mb-4 flex-wrap">
              <VoxelCube color="cyan" size={15} />
              <VoxelCube color="purple" size={15} />
              <VoxelCube color="green" size={15} />
              <VoxelCube color="orange" size={15} />
              <VoxelCube color="red" size={15} />
              <VoxelCube color="yellow" size={15} />
            </div>
            <h3 className="font-bold text-white mb-2">Реалистичная разрушаемость</h3>
            <p className="text-sm text-gray-400">Взрывы вырывают воронки, кубики разлетаются с физикой</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Footer ============
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[#1e3a2a]">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-cyan-400 rounded-sm flex items-center justify-center">
            <span className="text-xs font-bold text-black">VT</span>
          </div>
          <span className="font-bold text-white">Voxel Tanks</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Воксельные Танчики для Smart TV • Godot 4 • Android TV
        </p>
        <p className="text-gray-600 text-xs">
          Проект начат 12 августа 2026 • Методология: Вайбкодинг
        </p>
      </div>
    </footer>
  );
}

// ============ Main App ============
export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-gray-200">
      <Navigation />
      <HeroSection />
      <ConceptSection />
      <PlatformSection />
      <VisualStyleSection />
      <ControlsSection />
      <CameraSection />
      <TechSection />
      <GodotStructureSection />
      <RoadmapSection />
      <StatusSection />
      <Footer />
    </div>
  );
}
