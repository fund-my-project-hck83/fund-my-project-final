'use client';

import { Project } from '@/server/models/ProjectModel';

interface ImpactMetricsProps {
  impactMetrics: Project['impactMetrics'];
  projectName?: string;
}

export default function ImpactMetrics({ impactMetrics, projectName }: ImpactMetricsProps) {
  const getIcon = (index: number) => {
    const icons = ['🎯', '📈', '🌱', '👥', '💡', '🏆'];
    return icons[index % icons.length];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            📊 Dampak Nyata Yang Tercipta
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {projectName ? 
              `Lihat dampak nyata yang telah dicapai oleh proyek ${projectName}` :
              'Lihat dampak nyata yang telah dicapai oleh proyek-proyek kami'
            }
          </p>
        </div>

        {impactMetrics && impactMetrics.length > 0 ? (
          <div className="relative">
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {impactMetrics.map((metric, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 text-center border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-4xl mb-3">{getIcon(index)}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatNumber(metric.number)}
                  </div>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {metric.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {impactMetrics.map((metric, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 text-center border border-blue-100 min-w-[250px] snap-center flex-shrink-0"
                  >
                    <div className="text-4xl mb-3">{getIcon(index)}</div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatNumber(metric.number)}
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {metric.description}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Scroll Indicator */}
              <div className="flex justify-center mt-4 gap-2">
                {impactMetrics.map((_, index) => (
                  <div 
                    key={index} 
                    className="w-2 h-2 rounded-full bg-gray-300"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Belum ada data dampak
            </h3>
            <p className="text-gray-500">
              Data dampak proyek akan ditampilkan di sini setelah proyek berjalan
            </p>
          </div>
        )}

        {/* Call to Action */}
        {impactMetrics && impactMetrics.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ingin Menjadi Bagian dari Dampak Ini?
              </h3>
              <p className="text-blue-100 mb-6">
                Bergabunglah dengan ribuan donatur lainnya untuk menciptakan perubahan positif
              </p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Mulai Berdonasi Sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
