package backend.repository.erp;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import backend.model.erp.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // 🔄 ALTERADO: Busca subindo pelo relacionamento do Fornecedor
    List<Produto> findByFornecedor_Empresa_Id(Long empresaId);

    // 🔄 ALTERADO: Busca com Status subindo pelo relacionamento do Fornecedor
    List<Produto> findByStatusAndFornecedor_Empresa_Id(String status, Long empresaId);

    // 🔄 ALTERADO: Busca por Código de Barras subindo pelo relacionamento do Fornecedor
    Optional<Produto> findByCodigoBarrasAndFornecedor_Empresa_Id(String codigoBarras, Long empresaId);

    // 🔄 ALTERADO: Validação de existência subindo pelo relacionamento do Fornecedor
    boolean existsByCodigoBarrasAndFornecedor_Empresa_Id(String codigoBarras, Long empresaId);

    @Query("SELECT p FROM Produto p WHERE p.fornecedor.id = :fornecedorId AND p.fornecedor.empresa.id = :empresaId")
    List<Produto> findByFornecedorIdAndEmpresaId(@Param("fornecedorId") Long fornecedorId, @Param("empresaId") Long empresaId);

    // 🔄 CORRIGIDO: Ajustado o JPQL para p.fornecedor.emp.id em vez de p.empresa.id
    @Query("SELECT p FROM Produto p WHERE p.fornecedor.empresa.id = :empresaId AND LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Produto> buscarPorDescricaoEMultiTenant(@Param("termo") String termo, @Param("empresaId") Long empresaId);

    // 🔄 CORRIGIDO: Ajustado o JPQL para p.fornecedor.empresa.id
    @Query("SELECT p FROM Produto p WHERE p.fornecedor.empresa.id = :empresaId AND p.estoqueMinimo IS NOT NULL AND p.estoqueAtual <= p.estoqueMinimo")
    List<Produto> buscarEstoqueBaixoMultiTenant(@Param("empresaId") Long empresaId);

    // 🔄 CORRIGIDO: Ajustado o JPQL para p.fornecedor.empresa.id
    @Query("SELECT SUM(p.estoqueAtual * COALESCE(p.custoMedio, p.precoCusto, 0)) FROM Produto p WHERE p.fornecedor.empresa.id = :empresaId")
    BigDecimal calcularPatrimonioTotalBanco(@Param("empresaId") Long empresaId);
}