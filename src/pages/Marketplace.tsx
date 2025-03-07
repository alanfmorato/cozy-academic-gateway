
  const getFilteredProdutos = () => {
    let filtered = produtos.filter(produto => {
      const matchesSearch = 
        produto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (produto.descricao && produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produto.universidade?.nome && produto.universidade.nome.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesUniversidade = 
        !selectedUniversidade || selectedUniversidade === "all" || produto.universidade_id === selectedUniversidade;
      
      return matchesSearch && matchesUniversidade;
    });

    if (activeTab === "meus" && user) {
      filtered = filtered.filter(produto => 
        produto.usuario_id === user.id && 
        produto.status !== "vendido"
      );
    } else if (activeTab === "vendidos" && user) {
      filtered = filtered.filter(produto => 
        produto.usuario_id === user.id && 
        produto.status === "vendido"
      );
    } else if (activeTab === "todos") {
      filtered = filtered.filter(produto => produto.status !== "vendido");
    }

    return filtered;
  };
