import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const InhubXDChart = () => {
  const [data, setData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('São Paulo');
  const [loading, setLoading] = useState(true);

  const cities = ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Salvador', 'Porto alegre'];
  
  const dayColors = {
    'segunda-feira': '#FF6B6B',  // Vermelho para destacar picos
    'terça-feira': '#4ECDC4',    // Azul claro
    'quarta-feira': '#45B7D1',   // Azul
    'quinta-feira': '#96CEB4',   // Verde claro
    'sexta-feira': '#FFEAA7',    // Amarelo
    'sábado': '#FD79A8',         // Rosa para baixa operação
    'domingo': '#636E72'         // Cinza para zero operação
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await window.fs.readFile('Etapa 2.csv', { encoding: 'utf8' });
        
        const parsed = Papa.parse(csvData, {
          header: false,
          skipEmptyLines: true,
          delimiter: ';'
        });

        // Processar os dados - primeira linha é cabeçalho, segunda linha são os headers das cidades
        const headers = parsed.data[1];
        const cityIndex = {
          'São Paulo': 2,
          'Rio de Janeiro': 3,
          'Curitiba': 4,
          'Salvador': 5,
          'Porto alegre': 6
        };

        const processedData = [];
        
        // Começar da linha 2 (índice 2) para pular os cabeçalhos
        for (let i = 2; i < parsed.data.length; i++) {
          const row = parsed.data[i];
          if (row && row.length >= 7) {
            const date = row[0];
            const dayOfWeek = row[1];
            
            // Criar objeto com dados de todas as cidades
            const dayData = {
              date: date,
              dayOfWeek: dayOfWeek,
              shortDate: date ? date.split('/')[0] + '/' + date.split('/')[1] : '',
              'São Paulo': parseInt(row[2]?.replace(/\./g, '') || '0'),
              'Rio de Janeiro': parseInt(row[3]?.replace(/\./g, '') || '0'),
              'Curitiba': parseInt(row[4]?.replace(/\./g, '') || '0'),
              'Salvador': parseInt(row[5]?.replace(/\./g, '') || '0'),
              'Porto alegre': parseInt(row[6]?.replace(/\./g, '') || '0')
            };
            
            processedData.push(dayData);
          }
        }
        
        setData(processedData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getBarColor = (dayOfWeek) => {
    return dayColors[dayOfWeek] || '#8884d8';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{`${data.date} (${data.dayOfWeek})`}</p>
          <p className="text-blue-600">
            {`${selectedCity}: ${payload[0].value.toLocaleString('pt-BR')} unidades`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { payload } = props;
    if (payload && payload.dayOfWeek) {
      return <Bar {...props} fill={getBarColor(payload.dayOfWeek)} />;
    }
    return <Bar {...props} fill="#8884d8" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    value: item[selectedCity],
    fill: getBarColor(item.dayOfWeek)
  }));

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Volume de Inhub XD por Dia - Novembro 2024
        </h1>
        <p className="text-gray-600 mb-6">
          Análise do padrão de demanda: baixa operação sábados, zero domingos, picos segundas-feiras
        </p>

        {/* Seletor de Cidade */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Cidade:
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Legenda de Cores por Dia da Semana */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda por Dia da Semana:</h3>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {Object.entries(dayColors).map(([day, color]) => (
              <div key={day} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-sm mr-2" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="capitalize">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="shortDate"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
                fontSize={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Volume Inhub XD"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Análise dos Padrões */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <h4 className="font-semibold text-red-800">Picos nas Segundas-feiras</h4>
            <p className="text-sm text-red-700 mt-1">
              Acúmulo de demanda devido à parada de domingo
            </p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
            <h4 className="font-semibold text-pink-800">Sábados - Operação Reduzida</h4>
            <p className="text-sm text-pink-700 mt-1">
              Volume significativamente menor comparado aos dias úteis
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
            <h4 className="font-semibold text-gray-800">Domingos - Zero Operação</h4>
            <p className="text-sm text-gray-700 mt-1">
              Nenhuma atividade registrada aos domingos
            </p>
          </div>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Resumo para {selectedCity}:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Total do Mês:</span>
              <div className="text-lg font-bold text-blue-800">
                {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Média Diária:</span>
              <div className="text-lg font-bold text-blue-800">
                {Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Maior Volume:</span>
              <div className="text-lg font-bold text-blue-800">
                {Math.max(...chartData.map(item => item.value)).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Dias Ativos:</span>
              <div className="text-lg font-bold text-blue-800">
                {chartData.filter(item => item.value > 0).length} de {chartData.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expor o componente na variável window para acesso direto
window.InhubXDChart = InhubXDChart;

// Manter o export default para compatibilidade
export default InhubXDChart;