import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const SVCDistributionBacklogAnalysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('pie');
  const [selectedDate, setSelectedDate] = useState('');

  const svcColors = {
    'SSP1': '#FF6B6B',  // Vermelho - 30%
    'SRJ1': '#4ECDC4',  // Azul claro - 27%
    'SCW1': '#45B7D1',  // Azul - 20%
    'SBA1': '#96CEB4',  // Verde - 15%
    'SPA1': '#FFEAA7'   // Amarelo - 8%
  };

  const svcPercentages = {
    'SSP1': 30,
    'SRJ1': 27,
    'SCW1': 20,
    'SBA1': 15,
    'SPA1': 8
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await window.fs.readFile('Etapa 3.csv', { encoding: 'utf8' });
        
        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          delimiter: ';',
          dynamicTyping: false
        });

        const processedData = parsed.data.map(row => {
          // Limpar e converter os dados
          const totalInhub = parseInt(row['Total Inhub (FULL + XD)']?.replace(/\./g, '') || '0');
          
          return {
            date: row['Data ']?.trim(),
            dayOfWeek: row['Dia da Semana'],
            totalInhub: totalInhub,
            shortDate: row['Data ']?.trim() ? row['Data '].trim().split('/')[0] + '/' + row['Data '].trim().split('/')[1] : '',
            SSP1: parseInt(row['SSP1 (30%)'] || '0'),
            SRJ1: parseInt(row['SRJ1 (27%)'] || '0'),
            SCW1: parseInt(row['SCW1 (20%)'] || '0'),
            SBA1: parseInt(row['SBA1 (15%)'] || '0'),
            SPA1: parseInt(row['SPA1 (8%)'] || '0')
          };
        }).filter(item => item.date && item.date !== '');
        
        setData(processedData);
        if (processedData.length > 0) {
          setSelectedDate(processedData[0].date);
        }
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

  // Preparar dados para gráfico de distribuição SVC
  const totalSVCVolume = data.reduce((acc, day) => {
    acc.SSP1 += day.SSP1;
    acc.SRJ1 += day.SRJ1;
    acc.SCW1 += day.SCW1;
    acc.SBA1 += day.SBA1;
    acc.SPA1 += day.SPA1;
    return acc;
  }, { SSP1: 0, SRJ1: 0, SCW1: 0, SBA1: 0, SPA1: 0 });

  const svcDistributionData = Object.entries(totalSVCVolume).map(([svc, value]) => ({
    name: svc,
    value: value,
    percentage: svcPercentages[svc],
    color: svcColors[svc]
  }));

  // Preparar dados para gráfico de linha (backlog/tendência)
  const timeSeriesData = data.map(item => ({
    ...item,
    totalSVC: item.SSP1 + item.SRJ1 + item.SCW1 + item.SBA1 + item.SPA1,
    backlogAdjustment: item.totalInhub - (item.SSP1 + item.SRJ1 + item.SCW1 + item.SBA1 + item.SPA1)
  }));

  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-blue-600">{`Volume: ${data.value.toLocaleString('pt-BR')}`}</p>
          <p className="text-gray-600">{`Percentual: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipLine = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString('pt-BR')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Análise de Distribuição SVC e Backlog - Novembro 2024
        </h1>
        <p className="text-gray-600 mb-6">
          Etapa 3: Distribuição entre SVCs | Etapa 4: Análise de Ajustes por Backlog
        </p>

        {/* Seção 1: Distribuição dos SVCs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Etapa 3: Distribuição do Inhub entre SVCs
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  chartType === 'pie' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pizza
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  chartType === 'bar' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Barras
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={svcDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {svcDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipPie />} />
                  </PieChart>
                ) : (
                  <BarChart data={svcDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => value.toLocaleString('pt-BR')} />
                    <Tooltip content={<CustomTooltipPie />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {svcDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Resumo da Distribuição</h3>
              {svcDistributionData.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: svc.color }}
                    ></div>
                    <span className="font-medium">{svc.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      {svc.value.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {svc.percentage}% esperado
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total:</span>
                  <span>
                    {Object.values(totalSVCVolume).reduce((a, b) => a + b, 0).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Análise de Backlog */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Etapa 4: Análise de Ajustes por Backlog
          </h2>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="shortDate"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                interval={0}
              />
              <YAxis tickFormatter={(value) => value.toLocaleString('pt-BR')} />
              <Tooltip content={<CustomTooltipLine />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalInhub" 
                stroke="#FF6B6B" 
                strokeWidth={3}
                name="Total Inhub (FULL + XD)"
                dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalSVC" 
                stroke="#4ECDC4" 
                strokeWidth={2}
                name="Total Distribuído SVCs"
                dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="backlogAdjustment" 
                stroke="#FFA726" 
                strokeWidth={2}
                name="Ajuste/Backlog"
                dot={{ fill: '#FFA726', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Análises e Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Insights da Distribuição SVC</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• SSP1 concentra 30% do volume total</li>
              <li>• SRJ1 representa 27% da operação</li>
              <li>• Distribuição alinhada com percentuais esperados</li>
              <li>• SCW1, SBA1 e SPA1 completam a cobertura</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-3">Análise do Backlog</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Períodos com zero indicam paradas operacionais</li>
              <li>• Picos de backlog após retomadas</li>
              <li>• Diferença entre Total Inhub e SVCs mostra ajustes</li>
              <li>• Impacto direto na eficiência de atendimento</li>
            </ul>
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Estatísticas do Período</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Inhub:</span>
              <div className="text-lg font-bold text-gray-800">
                {data.reduce((sum, item) => sum + item.totalInhub, 0).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Total SVCs:</span>
              <div className="text-lg font-bold text-gray-800">
                {Object.values(totalSVCVolume).reduce((a, b) => a + b, 0).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Dias Ativos:</span>
              <div className="text-lg font-bold text-gray-800">
                {data.filter(item => item.totalInhub > 0).length} de {data.length}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Maior Volume:</span>
              <div className="text-lg font-bold text-gray-800">
                {Math.max(...data.map(item => item.totalInhub)).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expor o componente na variável window para acesso direto
window.SVCDistributionBacklogAnalysis = SVCDistributionBacklogAnalysis;

// Manter o export default para compatibilidade
export default SVCDistributionBacklogAnalysis;