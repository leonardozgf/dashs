import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import Papa from 'papaparse';

const ForecastAccuracyKPIs = () => {
  const [data, setData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('weekly');

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await window.fs.readFile('Cópia de Etapa_5.csv', { encoding: 'utf8' });
        
        const parsed = Papa.parse(csvData, {
          header: false,
          skipEmptyLines: true,
          delimiter: ';'
        });

        // Processar dados - primeira linha é cabeçalho
        const processedData = [];
        
        for (let i = 1; i < parsed.data.length; i++) {
          const row = parsed.data[i];
          if (row && row.length >= 7) {
            const date = row[0];
            const dayOfWeek = row[1];
            
            // Converter valores, tratando tanto formato brasileiro quanto americano
            const totalInhub = parseFloat(row[2]?.replace(/[.,]/g, match => match === ',' ? '.' : '')) || 0;
            const planejado = parseFloat(row[3]?.replace(/[.,]/g, match => match === ',' ? '.' : '')) || 0;
            const desvioAbsoluto = parseFloat(row[4]?.replace(/[.,]/g, match => match === ',' ? '.' : '')) || 0;
            
            // Calcular métricas
            const ape = planejado > 0 ? Math.abs((totalInhub - planejado) / planejado) * 100 : 0;
            const bias = planejado > 0 ? ((totalInhub - planejado) / planejado) * 100 : 0;
            
            processedData.push({
              date: date,
              dayOfWeek: dayOfWeek,
              shortDate: date ? date.split('/')[0] + '/' + date.split('/')[1] : '',
              totalInhub: totalInhub,
              planejado: planejado,
              desvioAbsoluto: desvioAbsoluto,
              ape: ape,
              bias: bias,
              accuracy: planejado > 0 ? Math.max(0, 100 - ape) : 100
            });
          }
        }
        
        setData(processedData);
        
        // Calcular dados semanais
        const weeks = [];
        let currentWeek = [];
        let weekNumber = 1;
        
        processedData.forEach((day, index) => {
          currentWeek.push(day);
          
          // Nova semana a cada 7 dias ou no final
          if (currentWeek.length === 7 || index === processedData.length - 1) {
            const validDays = currentWeek.filter(d => d.planejado > 0);
            
            if (validDays.length > 0) {
              const weekMape = validDays.reduce((sum, d) => sum + d.ape, 0) / validDays.length;
              const weekBias = validDays.reduce((sum, d) => sum + d.bias, 0) / validDays.length;
              const weekAccuracy = validDays.reduce((sum, d) => sum + d.accuracy, 0) / validDays.length;
              
              const totalPlanned = validDays.reduce((sum, d) => sum + d.planejado, 0);
              const totalActual = validDays.reduce((sum, d) => sum + d.totalInhub, 0);
              
              weeks.push({
                week: `Semana ${weekNumber}`,
                weekNumber: weekNumber,
                dateRange: `${currentWeek[0].shortDate} - ${currentWeek[currentWeek.length - 1].shortDate}`,
                mape: weekMape,
                bias: weekBias,
                accuracy: weekAccuracy,
                totalPlanned: totalPlanned,
                totalActual: totalActual,
                daysCount: validDays.length,
                // Classificação de qualidade
                mapeCategory: weekMape <= 10 ? 'Excelente' : weekMape <= 20 ? 'Bom' : weekMape <= 30 ? 'Aceitável' : 'Ruim',
                biasCategory: Math.abs(weekBias) <= 5 ? 'Excelente' : Math.abs(weekBias) <= 15 ? 'Bom' : Math.abs(weekBias) <= 25 ? 'Aceitável' : 'Ruim'
              });
            }
            
            currentWeek = [];
            weekNumber++;
          }
        });
        
        setWeeklyData(weeks);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-600 mb-2">{data.dateRange}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}${entry.name.includes('MAPE') || entry.name.includes('BIAS') ? '%' : ''}`}
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {`${data.daysCount} dias válidos`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getColorByValue = (value, type) => {
    if (type === 'mape') {
      if (value <= 10) return '#4CAF50'; // Verde - Excelente
      if (value <= 20) return '#8BC34A'; // Verde claro - Bom
      if (value <= 30) return '#FFC107'; // Amarelo - Aceitável
      return '#F44336'; // Vermelho - Ruim
    } else { // bias
      const absValue = Math.abs(value);
      if (absValue <= 5) return '#4CAF50'; // Verde - Excelente
      if (absValue <= 15) return '#8BC34A'; // Verde claro - Bom
      if (absValue <= 25) return '#FFC107'; // Amarelo - Aceitável
      return '#F44336'; // Vermelho - Ruim
    }
  };

  // Calcular KPIs gerais
  const overallMape = weeklyData.length > 0 ? weeklyData.reduce((sum, w) => sum + w.mape, 0) / weeklyData.length : 0;
  const overallBias = weeklyData.length > 0 ? weeklyData.reduce((sum, w) => sum + w.bias, 0) / weeklyData.length : 0;
  const overallAccuracy = weeklyData.length > 0 ? weeklyData.reduce((sum, w) => sum + w.accuracy, 0) / weeklyData.length : 0;

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          KPIs de Forecast Accuracy - Etapa 5
        </h1>
        <p className="text-gray-600 mb-6">
          Análise de MAPE e BIAS por semana para avaliação da precisão das previsões
        </p>

        {/* KPIs Resumo */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-800">MAPE Geral</h3>
            <div className="text-2xl font-bold text-blue-900">
              {overallMape.toFixed(1)}%
            </div>
            <p className="text-sm text-blue-700">
              {overallMape <= 10 ? 'Excelente' : overallMape <= 20 ? 'Bom' : overallMape <= 30 ? 'Aceitável' : 'Ruim'}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <h3 className="font-semibold text-green-800">BIAS Geral</h3>
            <div className="text-2xl font-bold text-green-900">
              {overallBias > 0 ? '+' : ''}{overallBias.toFixed(1)}%
            </div>
            <p className="text-sm text-green-700">
              {Math.abs(overallBias) <= 5 ? 'Excelente' : Math.abs(overallBias) <= 15 ? 'Bom' : Math.abs(overallBias) <= 25 ? 'Aceitável' : 'Ruim'}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
            <h3 className="font-semibold text-purple-800">Accuracy Geral</h3>
            <div className="text-2xl font-bold text-purple-900">
              {overallAccuracy.toFixed(1)}%
            </div>
            <p className="text-sm text-purple-700">
              {overallAccuracy >= 90 ? 'Excelente' : overallAccuracy >= 80 ? 'Bom' : overallAccuracy >= 70 ? 'Aceitável' : 'Ruim'}
            </p>
          </div>
        </div>

        {/* Gráfico Principal */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              MAPE e BIAS por Semana
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewType('weekly')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewType === 'weekly' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setViewType('combined')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  viewType === 'combined' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Combinado
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={450}>
            {viewType === 'weekly' ? (
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="mape" 
                  name="MAPE (%)" 
                  fill="#FF6B6B"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="bias" 
                  name="BIAS (%)" 
                  fill="#4ECDC4"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            ) : (
              <ComposedChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="mape" 
                  name="MAPE (%)" 
                  fill="#FF6B6B"
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="bias" 
                  stroke="#4ECDC4" 
                  strokeWidth={3}
                  name="BIAS (%)"
                  dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#96CEB4" 
                  strokeWidth={2}
                  name="Accuracy (%)"
                  dot={{ fill: '#96CEB4', strokeWidth: 2, r: 3 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Tabela Detalhada */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalhamento Semanal</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semana
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MAPE
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BIAS
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias Válidos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weeklyData.map((week, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {week.week}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {week.dateRange}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                        style={{ backgroundColor: getColorByValue(week.mape, 'mape') }}
                      >
                        {week.mape.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                        style={{ backgroundColor: getColorByValue(week.bias, 'bias') }}
                      >
                        {week.bias > 0 ? '+' : ''}{week.bias.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {week.accuracy.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {week.daysCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interpretação dos KPIs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Interpretação MAPE</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>≤ 10%: Excelente precisão</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span>10-20%: Boa precisão</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>20-30%: Precisão aceitável</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>> 30%: Precisão ruim</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">Interpretação BIAS</h4>
            <div className="text-sm text-green-700 space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>±5%: Excelente equilibrio</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span>±5-15%: Bom equilíbrio</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>±15-25%: Equilíbrio aceitável</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>> ±25%: Desequilíbrio significativo</span>
              </div>
              <p className="text-xs mt-2 text-green-600">
                BIAS positivo = superestimação | BIAS negativo = subestimação
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expor o componente na variável window para acesso direto
window.ForecastAccuracyKPIs = ForecastAccuracyKPIs;

// Manter o export default para compatibilidade
export default ForecastAccuracyKPIs;